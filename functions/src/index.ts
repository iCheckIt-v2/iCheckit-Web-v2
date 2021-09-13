import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors")({origin: true});
const nodemailer = require('nodemailer');
// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});
const APP_NAME = 'iCheckit';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

const db = admin.firestore();
const settings = {timeStampInSnapshots: true};
db.settings(settings);

exports.adminCreateStudent = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
    } else {
      const body = request.body;
      const displayName = body.displayName;
      /*
        const section = body.section;
        const course = body.course;
        const contactNumber = body.contactNumber;
        */
      const email = body.email;
      const password = "password";

      admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        displayName: displayName,
        disabled: false,
      })
          .then((userRecord) => {
            return response.status(200).send({
              message: "successfully created user",
              userRecord,
            });
          })
          .catch((error) => {
            return response.status(400).send("Failed to create user: " + error);
          });
    }
  }
  );
});

exports.deleteUser = functions.firestore
    .document('users/{id}')
    .onDelete((snap, context) => {

        const deletedValue = snap.data();
        const userEmail = deletedValue.email;

        return admin.auth().getUserByEmail(userEmail)
            .then(userRecord => {
                const userID = userRecord.uid;
                return admin.auth().deleteUser(userID)
            })
            .catch(error => {
                console.log(error.message);
                return null;
            })
    });

exports.updateUser = functions.firestore
    .document('users/{id}')
    .onUpdate((change, context) => {

        const updatedValues = change.after.data();
        // const userEmail = deletedValue.email;
        const uid = updatedValues.uid;
        const userEmail = updatedValues.email;
        const displayName = updatedValues.displayName;
        return admin.auth().getUser(uid)
            .then(userRecord => {
                const userID = userRecord.uid;
                return admin.auth().updateUser(userID, {
                    displayName: displayName,
                    email: userEmail
                })
            })
            .catch(error => {
                console.log(error.message);
                return null;
            })
    });

    exports.sendPushNotification = functions.firestore
 .document("tasks/{taskId}")
 .onCreate((event) => {

// Access data required for payload notification
const data = event.data();
const taskTitle = data.title;
const pushTokens = data.pushTokens;
const recipients = data.recipients;

// Determine the message
const payload = {
  notification: {
    title: taskTitle,
    body: 'A new task has been uploaded. Click on this notification to open the application.',
    sound: 'default',
    badge: '1'
  }
}
console.log(payload);
pushTokens.forEach((element: any) => {
  if (element.pushToken == '') {
      console.log('no push token')
  }   
  else if (element.pushToken != '') {
      console.log(element.pushToken);
      return admin.messaging().sendToDevice(element.pushToken, payload);
  }
});
recipients.forEach(async (element: any) => {
  if (element.email == '') {
      console.log('no email')
  }   
  else if (element.email != '') {
    const mailOptions = {
      from: `${APP_NAME} <noreply@firebase.com>`,
      to: element.email,
      subject: `Welcome to ${APP_NAME}!`,
      text: `Hey ${element.displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
    };
  
    await mailTransport.sendMail(mailOptions);
    functions.logger.log('New welcome email sent to:', element.email);
    return null;  }
});
// // Get the user's tokenID
// var pushToken = "";
// return functions
// .firestore
//   .collection("Users/{user-ID}")
//   .get()
//   .then((doc) => {
//     pushToken = doc.data().tokenID;
//     // Send the message to the device
//     return admin.messaging().sendTodevice(pushToken, message)
//   });
});