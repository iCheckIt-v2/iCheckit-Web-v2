import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors")({origin: true});

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
