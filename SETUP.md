## Instructions

I'll write a proper documentation as per the availability.
The following repository currently is for *code-preview* only.

\* By the time, feel free to mark any issues under the **Issues** section of this repository.

### Setup

Please do replace the following details mentioned in the codebase for the following paths:

- `firebase/.firebaserc` : ( Add project name @ line-3 )

- `public/.well-known/assetlinks.json` : ( Update "*sha256_cert_fingerprints*" )

- `web/cloud-run/index.js` : ( Instance URI @ line-11 )

- `web/react/src/firebase-config.js` : ( firebase-config @ line-9 && default-region @ line-16 )

  [ Also, paste the generated build inside `firebase/public` directory ]

- Refer to [firebase-docs](https://firebase.google.com/docs) and [cloud-run-docs](https://cloud.google.com/run) for more information regarding setting up environment for deployment.
