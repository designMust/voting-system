import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, set, ref, update, get, child, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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
const vote = document.querySelectorAll('.votebutton.w-embed');
const voted = document.querySelectorAll('.votedbutton.w-button');
const fake = document.querySelectorAll('.votefake.w-button');
const votingWrapper = document.querySelectorAll('.votingwrapper');

const listsID = [
  {
    id: "list1",
    counter: "contadorlist1"
  },
  {
    id: "list2",
    counter: "contadorlist2"
  },
  {
    id: "list3",
    counter: "contadorlist3"
  },
  {
    id: "list4",
    counter: "contadorlist4"
  }
];

/*const listsID = [
  "list1", 
  "list2", 
  "list3"
];
  
var counters = [
  contadorlist1,
  contadorlist2,
  contadorlist3
];

var votesCount = new Array();*/

//Contabilizar votos y guardarlos en la array votesCount[]

readAndWriteVotes();
//readVotes();
//console.log(votesCount);
//console.log(listsID);

//User State Observer

onAuthStateChanged(auth, (user) => {
  if (user) { // User is signed in
    
    const uid = user.uid;
    const dbRef = ref(database);
    
    get(child(dbRef, '/users/' + uid + '/votes')).then((snapshot) =>{
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    })
    
    /*get(ref(database, 'lists/' + listID.id), (snapshot) => {

    })
    
    get(child(database, 'users/' + uid + '/votos'))
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    })*/
    
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
    var currentList = this.id;
    
    /*const db = getDatabase();

    var userVotes = {
      [currentList]: true
    }
    
    const voteByUser = {
      [uid]: true
    }

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates = {};
    updates['/users/' + uid + currentList] = userVotes;
    updates['/lists/' + currentList + uid ] = voteByUser;

    return update(ref(db), updates);*/
    
    update(ref(database, 'users/' + uid + '/votos'),{
      [currentList]: true
    }).then(() => {
      update(ref(database, 'lists/' + currentList),{
      [uid]: true
      });
      console.log("Voto procesado");
    })
    
    /*update(ref(database, 'users/' + uid),{
      [currentList]: true
    }).then(() => {
      console.log("Voto procesado");
      location.reload();
    })*/
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

  if (terms.checked === true) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {

      const user = userCredential.user;
      const uid = user.uid;

      set(ref(database, 'users/' + uid),{
          username: username,
          userEmail: email,
          Created: date
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
    url: 'https://discovermust-firebase-bdf453be46d614181.webflow.io/challenge/madrid/foodie/listas',
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
      errorTextSingUp.innerText = "Este correo electrónico ya está en uso.";
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
  
  signInButton.style.display="none"; //Hide SignIn link
  signOutButton.style.display="block"; //Show SignOut link
  
  for (const voteButton of vote) { //Show real vote button
    voteButton.style.display = "block";
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
  
  for (const voteButton of vote) { //Show real vote button
    voteButton.style.display = "none";
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
      //let listObject = snapshot.val();
      //let count = String(Object.keys(listObject).length);
      //let currentCounter = listID.counter;
      $("#" + listID.counter).text(String(Object.keys(snapshot.val()).length));
    })
  });
}

/*function readVotes() { //Read votes values from database and show it on the web
  
  /*const dbRef = ref(database);

  listsID.forEach (listID => 
    get(child(dbRef, '/lists/' + listID + '/votes')).then((snapshot) =>{
      countVariable = snapshot.val();
      console.log("Los votos son " + countVariable);
      console.log(span[actual])
      span[actual].textContent = countVariable;
      actual ++;
    })
  );*/
  
  /*listsID.forEach (listID =>
    onValue(ref(database, 'lists/' + listID + '/votes'), (snapshot) => {
    countVariable = snapshot.val();
    console.log(countVariable);
    span[actual].textContent = countVariable;
    actual++;
    })
  );
}*/

/*function readVotes() {
  
  listsID.forEach (listID =>
    onValue(ref(database, 'lists/' + listID), (snapshot) => {
      let listObject = snapshot.val();
      //let count = String(Object.keys(listObject).length);
      //votesCount.push(count);
      votesCount.push(listObject);
    })
  );
}*/

/*function writeVotes(){

  for (var i = 0; i < 3; i++) {
    console.log(votesCount.at(i));
    console.log(counters.at(i));
    //counters[i].textContent = currentVotes.at(i);
    counters[i].innerText = votesCount.at(i);
  }
  
}*/
