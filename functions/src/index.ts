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
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
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
            const mailOptions = {
              from: `${APP_NAME} <noreply@firebase.com>`,
              to: email,
              subject: `Welcome to ${APP_NAME}!`,
              text: `Hey ${displayName}! Welcome to ${APP_NAME}. I hope you will enjoy our service. We aim to provide a platform for students in terms of submission and keeping track of non academic college-wide tasks. Visit our mobile application to view all the tasks uploaded in our system.`
            };
            mailTransport.sendMail(mailOptions);
            functions.logger.log('New welcome email sent to:', email);
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
const uploadedBy = data.uploadedBy;
const pushTokens = data.pushTokens;
const deadline = data.deadline;
const recipients = data.recipients;
const description = data.description;

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
      console.log('sent to :', element.pushToken);
      admin.messaging().sendToDevice(element.pushToken, payload);
  }
});
recipients.forEach((element: any) => {
  if (element.email == '') {
      console.log('no email')
  }   
  else if (element.email != '') {
    const mailOptions = {
      from: `${APP_NAME} <noreply@firebase.com>`,
      to: element.email,
      subject: `New Task Assignment - <${taskTitle}>`,
      // text: `Hey ${element.displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
      html: `<h2>A new task has been uploaded for you.</h2>
      <p>1.) ${taskTitle}</p>
      <p>- ${description}
      <ul>
      <li>Uploaded by: ${uploadedBy}</li>
      <li>Deadline: ${new Date(deadline).toUTCString()}</li>
      </ul>
      <br>
      <p>Please submit your proof of completion on or before the said deadline</p>
      `
    };
    mailTransport.sendMail(mailOptions);
    functions.logger.log('New welcome email sent to:', element.email);
  }
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

exports.sendEmail = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
    }
    else {
      if (request.body.pushToken != '') {
        console.log(request.body.pushToken);
        const body = request.body;
        const email = body.email;
        const uploadedBy = body.uploadedBy;
        const title = body.title;
        const deadline = body.deadline;
        const description = body.description;
        const message = body.message;
        const status = body.status;
        const instructions = body.instructions;
  
        // Determine the message
        const payload = {
          notification: {
            title: `${status} - <${title}>`,
            body: `${message}`,
            badge: '1'
          }
        }  
        const mailOptions = {
          from: `${APP_NAME} <noreply@firebase.com>`,
          to: email,
          subject: `${status} - <${title}>`,
          // text: `Hey ${element.displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
          html: `<h2>${message}</h2>
          <p>1.) ${title}</p>
          <p>- ${description}
          <ul>
          <li>Uploaded by: ${uploadedBy}</li>
          <li>Deadline: ${new Date(deadline).toUTCString()}</li>
          </ul>
          <br>
          <p>${instructions}</p>
          `
        };
        mailTransport.sendMail(mailOptions);
        functions.logger.log('New welcome email sent to:', email);
        return admin.messaging().sendToDevice(request.body.pushToken, payload);
      }
      if (request.body.pushToken == '') {
        const body = request.body;
        const email = body.email;
        const uploadedBy = body.uploadedBy;
        const title = body.title;
        const deadline = body.deadline;
        const description = body.description;
        const message = body.message;
        const status = body.status;
        const instructions = body.instructions;
  
        const mailOptions = {
          from: `${APP_NAME} <noreply@firebase.com>`,
          to: email,
          subject: `${status} - <${title}>`,
          // text: `Hey ${element.displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
          html: `<h2>${message}</h2>
          <p>1.) ${title}</p>
          <p>- ${description}
          <ul>
          <li>Uploaded by: ${uploadedBy}</li>
          <li>Deadline: ${new Date(deadline).toUTCString()}</li>
          </ul>
          <br>
          <p>${instructions}</p>
          `
        };
        mailTransport.sendMail(mailOptions);
        functions.logger.log('New welcome email sent to:', email);
        return null; 
      }
    }
  });
});