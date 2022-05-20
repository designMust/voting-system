import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, set, ref, update, get, child, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBoXdCejk_RUyPnO3xVcegdzYliimivJAQ",
  authDomain: "foodie-challenge.firebaseapp.com",
  databaseURL: "https://foodie-challenge-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "foodie-challenge",
  storageBucket: "foodie-challenge.appspot.com",
  messagingSenderId: "549390693296",
  appId: "1:549390693296:web:e201f0d9997de701821c75",
  measurementId: "G-MEMCTXWV1R"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);  
const database = getDatabase(app);
const auth = getAuth();

// Global const, var, let objects

const user = auth.currentUser;
const vote = document.querySelectorAll('.votewrapper.w-embed');
const fake = document.querySelectorAll('.votefake.w-button');
const votingWrapper = document.querySelectorAll('.votingwrapper');

const listsID = [
  {
    id: "nombreDelaLista",
    counter: "contadornombreDelaLista"
  }
];

readAndWriteVotes();

//User State Observer

onAuthStateChanged(auth, (user) => {
  if (user) { // User is signed in    
    userSignedIn();
    stopLoadingScreen();
    console.log('User is logged in!');
  } else { // User is signed out.
    userSignedOut();
    stopLoadingScreen();
    console.log('No user is logged in');
  }
}); 

//Run Sing Up method

signupButton.addEventListener('click', signup);

//Run Sing In method

signinButton.addEventListener('click', signin);

//Run Sing Out method

signOutButton.addEventListener('click',(e)=>{ //Sing Out
   signOut(auth).then(() => { //Se cerró la sesión
   
   }).catch((error) => { // An error happened.
     const errorCode = error.code;
     const errorMessage = error.message;
     console.log(errorMessage);
   });
});

// Run voting method (updating user database)

$('.clicked-button').click(
  function(){
    const user = auth.currentUser;
    var uid = user.uid;
    var email = user.email;
    var username = email.substring(0,email.indexOf('@')).replace(/[^a-zA-Z ]/g, "");
    var uniqueUsername = username + uid;
    var currentList = this.id;
    
    update(ref(database, 'users/' + uniqueUsername + '/votos'),{
      [currentList]: true,
    }).then(() => {
      update(ref(database, 'lists/' + currentList),{
      [email]: true
      });
      console.log("Voto procesado");
    })
  }
);


// CUSTOM FUNCTIONS

function formReset() { //Reset forms
  document.getElementById("signinForm").reset();
  document.getElementById("signupForm").reset();
}


function closeModal() { //Close modal automatically
  document.getElementById("closeModal").click();
}

$('.closeoverlay').click(function(){ //Reset forms and clear errors messages after closing modals.
  errorStatusSingIn.style.display="none";
  errorStatusSingUp.style.display="none";
  document.getElementById("signinForm").reset();
  document.getElementById("signupForm").reset();
});

function signin() { //Sing in
  
  var email = signinEmail.value;
  var password = signinPassword.value;

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in
    
    const user = userCredential.user;
    var verification = user.emailVerified;
    
    if (verification === false) {
    
      console.log("Usuario no verificado");
      signOut(auth).then(() => {
        errorTextSingIn.innerText = "Verifica tu correo electrónico para iniciar sesión.";
        errorStatusSingIn.style.display="block";
        formReset();
      });
      
    } else {
      console.log("Usuario verificado");
      formReset();
      closeModal();
    }
    // ...
  })
  .catch((error) => {
    errorSignIn(error);
  });
}

function errorSignIn(error) { //Error messages in Sign In method
  var errorCode = error.code;
  var errorMessage = error.message;
  
  switch (errorCode) {
    case "auth/wrong-password":
      errorTextSingIn.innerText = "Contraseña incorrecta.";
      errorStatusSingIn.style.display="block";
      formReset();
      break;
    case "auth/account-exists-with-different-credential":
      errorTextSingIn.innerText = "Esta cuenta está asociada a otro método de autenticación.";
      errorStatusSingIn.style.display="block";
      formReset();
      break;
    case "auth/no-such-provider":
      errorTextSingIn.innerText = "Esta cuenta está asociada a otro método de autenticación.";
      errorStatusSingIn.style.display="block";
      formReset();
      break;
    case "auth/unverified-email":
      errorTextSingIn.innerText = "Verifica tu correo electrónico para iniciar sesión.";
      errorStatusSingIn.style.display="block";
      formReset();
      break;
    case "auth/user-not-found":
      errorTextSingIn.innerText = "No existe ningún usuario con este correo electrónico.";
      errorStatusSingIn.style.display="block";
      formReset();
      break;
    case "auth/user-disabled":
      errorTextSingIn.innerText = "Esta cuenta se ha deshabilitado por infringir las normas de uso.";
      errorStatusSingIn.style.display="block";
      formReset();
      break;
    default:
      errorTextSingIn.innerText = "Algo está fallando. Si el error persiste ponte en contacto con nosotros.";
      errorStatusSingIn.style.display="block";
      formReset();
      break;
  }       
  
  console.log('Error code: ' + errorCode);
  console.log('Error message: ' + errorMessage);
  
}

function signup() { //Sign up
  
  var email = signupEmail.value;
  var password = signupPassword.value;
  var username = email.substring(0,email.indexOf('@')).replace(/[^a-zA-Z ]/g, "");
  var today = new Date();
  var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  var currentChallenge = "UNWTO Challenge";
  var uniqueUsername = username + uid;

  if (terms.checked === true) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {

      const user = userCredential.user;
      const uid = user.uid;

      set(ref(database, 'users/' + uniqueUsername),{
          username: username,
          userID: uid,
          userEmail: email,
          challenge: currentChallenge,
          created: date
      }).then(function() {
        signUpVerification();
      });
    })
      .catch(function (error) {
      errorSignUp(error);
    });
  }
}

function signUpVerification() { //Send a verification Mail after signing up

  var actionCodeSettings = {
    url: 'https://discovermust.com/challenge/sing-in',
    handleCodeInApp: false
  };
  
  const auth = getAuth();
  const user = auth.currentUser;
  sendEmailVerification(user, actionCodeSettings)
  .then(() => {
    signOut(auth)
    .then(() => {
      window.location.replace('/verification');
    })
  })
}

function errorSignUp(error) { //Error messages in Sign Up method
  var errorCode = error.code;
  var errorMessage = error.message;
  
  switch (errorCode) {
    case "auth/email-already-in-use":
      errorTextSingUp.innerText = "¡Vaya! Parece que ya te has registrado, prueba iniciar sesión haciendo click en el enlace de abajo.";
      errorStatusSingUp.style.display="block";
      formReset();
      break;
    default:
      errorTextSingUp.innerText = "Algo está fallando. Si el error persiste ponte en contacto con nosotros.";
      errorStatusSingUp.style.display="block";
      formReset();
      break;
  }       
  
  console.log('Error code: ' + errorCode);
  console.log('Error message: ' + errorMessage);
  
}

function userSignedIn() {
  
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user.uid;
  
  onValue(ref(database, 'users/' + uid + '/votos'), (snapshot) => {
    if (snapshot.exists()) {
      let listasVotadas = Object.keys(snapshot.val());
      let currentVotedList;
      listasVotadas.forEach( function(lista) {
        currentVotedList = document.getElementById(lista);
        if (currentVotedList != null) {
          //currentVotedList.classList.add("voted");
          currentVotedList = document.getElementById(lista);
          currentVotedList.style.backgroundColor = "#000000";
          currentVotedList.style.color = "white";
          currentVotedList.style.cursor = "default";
          currentVotedList.textContent = "Votaste";
          console.log("Este usuario votó: " + lista);  
        } else {
          console.log("El ID: " + lista + "no existe en esta página.");
        }
      });
    } else {
      console.log("Usuario ha votado todavía.")
    }
  })
  
  for (const votewrapper of vote) { //Show real vote button
    votewrapper.style.display = "block";
  }
  
  signInButton.style.display="none"; //Hide SignIn link
  signOutButton.style.display="block"; //Show SignOut link

  if (document.getElementById('quieroVotar') != null) {
    quieroVotar.style.display="none"; //Hide "Quiero Votar" button
  }
  
  for (const voteFake of fake) { //Hide fake vote button
    voteFake.style.display = "none";
  }
  for (const votingwrapper of votingWrapper) { //Change voting wrapper style
    votingwrapper.style.borderColor = "#00df89";
  }
}

function userSignedOut() {
  signOutButton.style.display="none"; //Hide SignOut link
  signInButton.style.display="block"; //Show SignIn link
  
  if (document.getElementById('quieroVotar') != null) {
    quieroVotar.style.display="block"; //Hide "Quiero Votar" button
  }
  
  for (const votewrapper of vote) { //Hide real vote button
    votewrapper.style.display = "none";
  }
  for (const voteFake of fake) { //Hide fake vote button
    voteFake.style.display = "block";
  }
  for (const votingwrapper of votingWrapper) { //Change voting wrapper style
    votingwrapper.style.borderColor = "#ababab";
  }
}

function stopLoadingScreen() {
  loadingScreen.style.display = 'none';
}

function readAndWriteVotes() {
  listsID.forEach((listID, index, array) => {
    onValue(ref(database, 'lists/' + listID.id), (snapshot) => {
      $("#" + listID.counter).text(String(Object.keys(snapshot.val()).length));
    })
  });
}
