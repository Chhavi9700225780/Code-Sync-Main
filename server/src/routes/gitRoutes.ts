import express, { Request, Response } from 'express';
import { simpleGit, SimpleGit, SimpleGitOptions, StatusResult } from 'simple-git';
import path from 'path';
import fs from 'fs-extra'; // Using fs-extra for ensuring directory exists

const router = express.Router();

// --- Placeholder: Replace with your actual functions ---
/**
 * Determines the absolute path to the user's project directory on the server.
 * IMPORTANT: Ensure this directory exists or is created.
 */
const getUserProjectPath = async (userId: string): Promise<string> => {
    // Example: Store projects in a base directory + user ID
    const projectPath = path.resolve(process.cwd(), 'user-projects', userId); // Use path.resolve for absolute path
    await fs.ensureDir(projectPath); // Create directory if it doesn't exist
    return projectPath;
};

/**
 * Extracts the user ID from the request. Replace with your authentication middleware logic.
 */
const getUserIdFromRequest = (req: Request): string | null => {
    // Example using a hypothetical req.user added by auth middleware
    // return req.user?.id || null;
    return "testUser"; // Replace with your actual user ID logic for testing
};
// --- End Placeholders ---

// --- SimpleGit Configuration ---
const gitOptions: Partial<SimpleGitOptions> = {
    // baseDir will be set dynamically per request
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
};

// Helper function to get a simple-git instance for a specific user's project path
const git = async (userId: string): Promise<SimpleGit> => {
    const projectPath = await getUserProjectPath(userId);
    return simpleGit(projectPath, gitOptions);
};

// --- API Routes ---

/**
 * POST /api/git/init
 * Initializes a Git repository in the user's project directory.
 */
router.post('/init', async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const gitInstance = await git(userId);
        const isRepo = await gitInstance.checkIsRepo();
        if (isRepo) {
            return res.status(400).json({ message: 'Repository already initialized.' });
        }
        await gitInstance.init();
        console.log(`Git repository initialized for user ${userId}`);
        res.status(200).json({ message: 'Repository initialized successfully.' });
    } catch (error: any) {
        console.error(`Error git init for ${userId}:`, error);
        res.status(500).json({ message: 'Failed to initialize repository.', error: error.message });
    }
});

/**
 * GET /api/git/status
 * Gets the status of the user's Git repository.
 */
router.get('/status', async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const gitInstance = await git(userId);
        const isRepo = await gitInstance.checkIsRepo();
        if (!isRepo) {
            // Return a specific status or object indicating not initialized
            return res.status(200).json({ initialized: false, message: 'Repository not initialized.' });
        }
        const status: StatusResult = await gitInstance.status();
        res.status(200).json({
            initialized: true,
            modified: status.modified,
            untracked: status.not_added,
            staged: status.staged,
            conflicted: status.conflicted,
            created: status.created, // simple-git includes these as well
            deleted: status.deleted,
            renamed: status.renamed,
            // Add other relevant status fields if needed
        });
    } catch (error: any) {
        console.error(`Error git status for ${userId}:`, error);
        res.status(500).json({ message: 'Failed to get repository status.', error: error.message });
    }
});

/**
 * POST /api/git/add
 * Stages specified files. Expects { files: ["path/to/file1.ts", "path/to/file2.js"] } in body.
 */
router.post('/add', async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { files } = req.body; // Expect an array of file paths relative to project root
    if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ message: 'No files specified to add.' });
    }

    try {
        const gitInstance = await git(userId);
        await gitInstance.add(files);
        res.status(200).json({ message: `Successfully staged ${files.length} file(s).` });
    } catch (error: any) {
        console.error(`Error git add for ${userId}:`, error);
        res.status(500).json({ message: 'Failed to stage files.', error: error.message });
    }
});

/**
 * POST /api/git/commit
 * Creates a commit with the staged changes. Expects { message: "Your commit message" } in body.
 */
router.post('/commit', async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: 'Commit message is required.' });
    }

    try {
        const gitInstance = await git(userId);
        // Optional: Configure user name/email if not set globally on server
        // await gitInstance.addConfig('user.name', 'Your App Bot');
        // await gitInstance.addConfig('user.email', 'bot@yourapp.com');
        const commitSummary = await gitInstance.commit(message);
        res.status(200).json({ message: 'Commit successful.', summary: commitSummary });
    } catch (error: any) {
        console.error(`Error git commit for ${userId}:`, error);
        // Handle specific errors like "nothing to commit"
        if (error.message.includes('nothing to commit')) {
             return res.status(400).json({ message: 'Nothing to commit, working tree clean.' });
        }
        res.status(500).json({ message: 'Failed to commit changes.', error: error.message });
    }
});

/**
 * POST /api/git/remote/add
 * Adds a remote repository. Expects { name: "origin", url: "https://github.com/..." } in body.
 */
router.post('/remote/add', async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name = 'origin', url } = req.body; // Default remote name to 'origin'
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: 'Remote repository URL is required.' });
    }

    try {
        const gitInstance = await git(userId);
        await gitInstance.addRemote(name, url);
        res.status(200).json({ message: `Remote '${name}' added successfully.` });
    } catch (error: any) {
        console.error(`Error git remote add for ${userId}:`, error);
         // Handle error if remote already exists
         if (error.message.includes('remote origin already exists')) {
             // Maybe offer to update the URL instead? For now, just report error.
             return res.status(400).json({ message: `Remote '${name}' already exists.` });
         }
        res.status(500).json({ message: 'Failed to add remote.', error: error.message });
    }
});

/**
 * POST /api/git/push
 * Pushes commits to a remote repository. Expects { remote: "origin", branch: "main" } in body.
 * !! REQUIRES AUTHENTICATION HANDLING !!
 */
router.post('/push', async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { remote = 'origin', branch = 'main' } = req.body;

    try {
        // --- AUTHENTICATION REQUIRED ---
        // TODO: Retrieve the user's stored Git token (e.g., GitHub PAT) securely.
        // const token = await getSecureUserToken(userId);
        // if (!token) {
        //     return res.status(401).json({ message: 'Git authentication token not configured.' });
        // }
        // TODO: Configure simple-git or the environment to use the token.
        // Option 1: Embed in URL (less secure if logged)
        // const remoteUrl = `https://${token}@github.com/user/repo.git`;
        // await gitInstance.push(remoteUrl, branch);
        // Option 2: Use git credential helper or specific simple-git config (preferred)
        // ---

        const gitInstance = await git(userId);
        // Example push - *** THIS WILL FAIL WITHOUT AUTH ***
        await gitInstance.push(remote, branch);

        res.status(200).json({ message: `Successfully pushed to ${remote}/${branch}.` });
    } catch (error: any) {
        console.error(`Error git push for ${userId}:`, error);
         // Handle common errors like authentication failure, non-fast-forward, etc.
         if (error.message.includes('Authentication failed')) {
             return res.status(401).json({ message: 'Authentication failed. Please check your token/credentials.' });
         }
        res.status(500).json({ message: 'Failed to push changes.', error: error.message });
    }
});

// Export the router
export default router;