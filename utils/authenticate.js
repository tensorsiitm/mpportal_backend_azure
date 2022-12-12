import firebaseConfig from "../configs/firebaseConfig.js";
import admin from "firebase-admin";

admin.initializeApp(firebaseConfig);

export const FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      req.body.uuid=req.user.uid;
      return next();
    })
    .catch((err) => {
      console.error('Error while verifying token ', err);
      return res.status(401).json(err);
    });
};