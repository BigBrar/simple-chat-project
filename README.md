# Real-Time Chat Application

This is a simple real-time chat application built using React for the frontend and Flask for the backend. The app supports user authentication, messaging, and planned profile features.

## Features
- **User Authentication**: Secure login system using authentication tokens.
- **Real-Time Messaging**:
  - Send and receive messages instantly.
  - Messages are stored in a database with details like sender, receiver, and timestamp.
- **Ping Mechanism**: Regularly checks for new messages to keep chats updated.

## Tech Stack
- **Frontend**: React with CSS modules.
- **Backend**: Flask with WebSocket for real-time communication.
- **Database**: SQLAlchemy for handling user, chat, and message data.


## Usage
1. Run both the backend and frontend servers.
2. Open the application in your browser.
3. Log in or sign up to start chatting.
4. Select a contact and begin messaging in real-time.

## Folder Structure
- **Backend**:
  - Flask app with routes for messaging and authentication.
  - Database models for users, chats, and messages.
- **Frontend**:
  - React components for chat UI and authentication.

## Future Improvements
- Add user profile management.
- Support for multimedia messages.

