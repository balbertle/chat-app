import logo from './logo.svg';
import './App.css';
import React, { useRef, useState } from 'react'; // Import React and necessary hooks from the 'react' library.
import './App.css'; // Import a CSS file for styling.

import firebase from 'firebase/compat/app'; // Import the Firebase app module.
import 'firebase/compat/firestore'; // Import the Firestore module from Firebase.
import 'firebase/compat/auth'; // Import the Authentication module from Firebase.
import { useAuthState } from 'react-firebase-hooks/auth'; // Import a custom hook for Firebase Authentication.
import { useCollectionData } from 'react-firebase-hooks/firestore'; // Import a custom hook for Firestore data.
firebase.initializeApp({
  apiKey: "AIzaSyBrOp0Z6l3pJtRi0WmKB_wfXlkFyDX1gHo",
  authDomain: "chat-app-6ab1e.firebaseapp.com",
  projectId: "chat-app-6ab1e",
  storageBucket: "chat-app-6ab1e.appspot.com",
  messagingSenderId: "617219156292",
  appId: "1:617219156292:web:a175346c8579b1feb74f11"
})
const auth = firebase.auth(); // Create an instance of the Firebase Authentication service.
const firestore = firebase.firestore(); // Create an instance of the Firebase Firestore service.

function App() { // Define the main React component for the application.

  const [user] = useAuthState(auth); // Use the custom Firebase Authentication hook to track the user's authentication state.

  return (
    <div className="App"> {/* Start of the main application component */}
      <div>
        <header>
          <h1>Chat App</h1> {/* Display the title of the application */}
          <SignOut /> {/* Render the SignOut component to allow users to sign out. */}
        </header>
      </div>
      <section>
        {user ? <ChatRoom /> : <SignIn />} {/* Conditionally render the ChatRoom or SignIn component based on the user's authentication state. */}
      </section>
    </div>
  );
}

function SignIn() { // Defines the SignIn component for user authentication.
  const signInWithGoogle = () => { // Function to initiate Google OAuth sign-in.
    const provider = new firebase.auth.GoogleAuthProvider(); // Create a Google OAuth provider.
    auth.signInWithPopup(provider) // Trigger the sign-in with a Google pop-up window.
      .catch((error) => alert(error.message));
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Continue with Google</button> {/* Render a button for signing in with Google. */}
    </>
  )
}

function SignOut() { // Defines the SignOut component for user sign-out.
  return auth.currentUser && ( // Render a sign-out button if a user is currently signed in.
    <button className="signoutButton" onClick={() => auth.signOut()}>Sign Out</button> // Render a sign-out button with an onClick event to trigger the sign-out process.
  )
}

function ChatRoom() { // Defines the ChatRoom component for displaying chat messages.
  const dummy = useRef(); // Create a reference to an HTML element for scrolling purposes.
  const messagesRef = firestore.collection('messages'); // Reference to the Firestore collection where chat messages are stored.
  const query = messagesRef.orderBy('createdAt').limit(25); // Query to retrieve the most recent 25 chat messages.

  const [messages] = useCollectionData(query, { idField: 'id' }); // Use a custom hook to retrieve and update chat messages.

  const [formValue, setFormValue] = useState(''); // Define a state variable for the message input form.

  const sendMessage = async (e) => { // Function to send a chat message.
    e.preventDefault(); // Prevent the default form submission behavior.

    const { uid, photoURL } = auth.currentUser; // Get the current user's UID and photoURL.

    await messagesRef.add({ // Add a new message to Firestore.
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue(''); // Clear the message input field.
    dummy.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the latest message for a smooth chat experience.
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)} {/* Display chat messages and pass them to the ChatMessage component. */}
        <span ref={dummy}></span> {/* Create an invisible element for scrolling purposes. */}
      </main>
      <div className="footer">
        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type message" /> {/* Message input field. */}
          <button className="sendButton" type="submit" disabled={!formValue}>Send</button> {/* Button to send a message. */}
        </form>
      </div>
    </>
  )
}

function ChatMessage(props) { // Defines the ChatMessage component for displaying individual chat messages.
  const { text, uid, photoURL } = props.message; // Extract message properties.

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'; // Determine the CSS class for message styling (sent or received).

  return (
    <>
      <div className={`message ${messageClass}`}> {/* Render the message with appropriate styling. */}
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} /> {/* Display the user's profile picture. */}
        <p>{text}</p> {/* Display the message text. */}
      </div>
    </>
  )
}

export default App; // Export the main App component as the default export for the module.