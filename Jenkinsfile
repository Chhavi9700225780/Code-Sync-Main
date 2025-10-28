pipeline {
    agent any // Run on any available Jenkins agent/node
     
      tools {
            // Use the NodeJS installation configured in Manage Jenkins -> Tools
            // The name 'NodeJS-18' MUST match the name you gave it in the Jenkins UI
            nodejs 'NodeJS-25'
        }
    // Environment variables needed for the pipeline
    environment {
        // Use credentials stored securely in Jenkins for AWS access
        // These IDs will need to be configured in Jenkins Credentials manager
        AWS_CREDS = credentials('aws-credentials-for-ecr')
        AWS_REGION = 'us-east-1' // e.g., 'us-east-1', 'ap-south-1'
        ECR_REGISTRY = '619071310531.dkr.ecr.us-east-1.amazonaws.com' // e.g., '123456789012.dkr.ecr.us-east-1.amazonaws.com'
        BACKEND_IMAGE_NAME = 'codesync-backend'
        FRONTEND_IMAGE_NAME = 'codesync-frontend'
        // Use Jenkins build number or Git commit hash for tagging
        IMAGE_TAG = "${env.BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
        // Backend URL needed for frontend build (use localhost for now, replace in CD)
        // Or determine dynamically if needed
        VITE_BACKEND_URL_BUILD_ARG = 'http://localhost:3000' // Placeholder for CI build
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                // Jenkins automatically checks out the code associated with the build
                checkout scm
            }
        }
         // --- NEW STAGE: Prepare Build Environment ---
        stage('Prepare Environment') {
            steps {
                echo 'Updating package list and installing prerequisites...'
                // Install libatomic1, docker.io, AND awscli
                sh '''
                    apt-get update && \
                    apt-get install -y libatomic1 docker.io awscli && \
                    apt-get clean && \
                    rm -rf /var/lib/apt/lists/*
                '''
                // Verify tools are installed
                sh 'docker --version'
                sh 'aws --version' // <-- Verify aws cli install
            }
        }
        // --- END NEW STAGE ---

        stage('Run Tests (Placeholder)') {
            steps {
                
                
                 echo 'Running npm install (if tests were active)...'
                // --- END FIX ---
                // Add test commands here later if you have them
                // Example for backend:
                 dir('server') {
                     sh 'npm install'
                     sh 'npm test'
                 }
                // Example for frontend:
                 dir('client') {
                    sh 'npm install'
                    sh 'npm test'
                 }
            }
        }

        stage('Build Backend Image') {
            steps {
                echo "Building backend image: ${ECR_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
                // Navigate to the server directory and build
                dir('server') {
                    script {
                        // Use docker.build command provided by Docker Pipeline plugin
                         def backendImage = docker.build("${ECR_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}", ".")
                    }
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo "Building frontend image: ${ECR_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                // Navigate to the client directory and build, passing the build arg
                dir('client') {
                    script {
                        // Pass VITE_BACKEND_URL as a build-arg
                        // NOTE: For CI builds, this URL might just be a placeholder if the actual
                        // connection happens at runtime or is configured differently in K8s.
                        // If your frontend needs the *real* backend URL during BUILD time,
                        // you might need a more dynamic way to set VITE_BACKEND_URL_BUILD_ARG.
                         def frontendImage = docker.build("${ECR_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}", "--build-arg VITE_BACKEND_URL=${VITE_BACKEND_URL_BUILD_ARG} .")
                    }
                }
            }
        }

        stage('Push Images to ECR') {
             steps {
                 echo "Logging into AWS ECR (${ECR_REGISTRY})..."
                 script {
                     // Use withAWS to make credentials available as environment variables
                     // (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, potentially AWS_SESSION_TOKEN)
                     withAWS(credentials: 'aws-credentials-for-ecr', region: env.AWS_REGION) {
                         // Use AWS CLI v2 login method (recommended)
                         sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_REGISTRY}"
                         echo "ECR Login successful."

                         echo "Pushing Backend Image..."
                         // Use sh directly or docker.image() - docker.image() might be cleaner
                         docker.image("${ECR_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}").push()
                         // sh "docker push ${ECR_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"

                         echo "Pushing Frontend Image..."
                         docker.image("${ECR_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}").push()
                         // sh "docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                     } // End withAWS
                     echo "Images pushed successfully."
                 } // End script
             } // End steps
        }
        // --- Add CD Stage Here Later ---
        // stage('Deploy to EKS') { ... }

    } // End stages

    post {
        always {
            echo 'Pipeline finished.'
            // Clean up workspace, etc.
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            // Send notifications, etc.
        }
        failure {
            echo 'Pipeline failed!'
            // Send error notifications, etc.
        }
    } // End post
} // End pipeline
