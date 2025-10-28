import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import User, { IUser } from '../models/User'; // Import your User model
import { v4 as uuidv4 } from 'uuid'; 

dotenv.config();

// Ensure GitHub OAuth credentials are set
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CALLBACK_URL) {
    console.error('FATAL ERROR: GitHub OAuth environment variables are not defined.');
    process.exit(1);
}

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL, 
    scope: ['user:email'] // Request only user email scope initially is often enough
},
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        const githubId = profile.id;
        const username = profile.username; 
        
        // Try getting the primary public email
        let email = profile.emails && profile.emails.find((e: any) => e.primary)?.value;
        // Fallback if primary not found or none public
        if (!email && profile.emails && profile.emails.length > 0) {
             email = profile.emails[0].value;
        }

        console.log(`GitHub auth attempt for user: ${username} (ID: ${githubId})`);
        // console.log(`Received Access Token: ${accessToken}`); // Maybe remove in production

        try {
            let user = await User.findOne({ githubId: githubId });

            if (user) {
                // User exists, update token if necessary
                if (user.githubAccessToken !== accessToken) {
                    user.githubAccessToken = accessToken; 
                    // Optionally update email/username if changed on GitHub?
                    // user.email = email || user.email; // Only update if GitHub provided one
                    // user.username = username; 
                    await user.save();
                    console.log(`Updated GitHub access token for user ${username}`);
                }
                return done(null, user); 
            } else {
                // New user via GitHub
                const newAppUserId = uuidv4(); 

                // --- HANDLE MISSING EMAIL ---
                let finalEmail = email;
                if (!finalEmail) {
                    // Create a placeholder email if none provided by GitHub
                    // IMPORTANT: Ensure this format doesn't clash with real emails
                    finalEmail = `${githubId}@github.placeholder.com`; 
                    console.log(`GitHub email missing for ${username}, using placeholder: ${finalEmail}`);
                }
                // Check if the email (real or placeholder) already exists for a LOCAL user
                 const existingUserWithEmail = await User.findOne({ email: finalEmail });
                 if (existingUserWithEmail && !existingUserWithEmail.githubId) {
                     // This email belongs to a local account. 
                     // Handle this conflict: maybe link accounts or show an error.
                     // For now, return an error to prevent overwriting/duplicate email.
                     console.error(`Error: Email ${finalEmail} already exists for a local account.`);
                     return done(new Error(`Email ${finalEmail} is already associated with a local account. Please log in with your password or link your GitHub account.` ), false);
                 }


                const newUser = new User({
                    appUserId: newAppUserId, 
                    username: username, 
                    email: finalEmail, // <-- Use finalEmail (real or placeholder)
                    githubId: githubId,
                    githubAccessToken: accessToken,
                    // NO password needed for GitHub users
                });
                
                await newUser.save();
                console.log(`Created new user ${username} from GitHub login.`);
                return done(null, newUser); 
            }
        } catch (err: any) { // Specify 'any' or a more specific error type
             console.error("Error during GitHub OAuth user find/create:", err);
             // Check for specific duplicate key errors (e.g., if placeholder email clashes)
             if (err.code === 11000) { // MongoDB duplicate key error code
                  return done(new Error("An account potentially conflict. Please try logging in differently."), false);
             }
            return done(err, false);
        }
    }
));

// Serialization/Deserialization (Keep as is)
passport.serializeUser((user: any, done) => {
    done(null, user.id); 
});

// src/config/passport.ts
passport.deserializeUser(async (id: string, done) => {
    console.log(`[deserializeUser] Attempting to find user with ID: ${id}`); // <-- ADD
    try {
        const user = await User.findById(id);
        if (!user) {
            console.error(`[deserializeUser] User NOT FOUND for ID: ${id}`); // <-- ADD
             done(null, false); // Important: Pass false if not found
             return;
        }
        console.log(`[deserializeUser] Successfully found user:`, user.username); // <-- ADD
        done(null, user);
    } catch (err) {
         console.error(`[deserializeUser] Error finding user by ID: ${id}`, err); // <-- ADD
        done(err, null);
    }
});
