### Welcome to the StudyNotion Full Stack Project

- SendOTP, Signup, Login controller is made inside the Auth.js along with User, Profile and Otp model

- auth middleware is made for authorized users then we proceed to make Change Password controller inside the Auth.js

- Reset Password Token and Reset Password controller is made inside the ResetPassword.js

- Category model is created along with Create Category and Get all Categories controller (Only Admin can create category) as without category, we cannot create Course

- Section model is created along with Create, Update and Delete controllers

- SubSection model is created along with Create, Update and Delete controllers

- Learn more about Cron Job [A cron job is a Linux command that schedules tasks to be executed in the future]

- Order has 3 states: Created (User clicks on the Pay button), Attempted (User does the payment), Paid (User does the payment successfully)

- Payment has 3 states: Created (User)

- When someone buys a course and does payment how will I know that the money came to me or not? We will have to do verify using `webhook (kind of notification)`. When someone does the payment successfully, the `webhook` setup on `Razorpay website` will hit the API route provided by the Backend (StudyNotion) but how can we know that razorpay has done it or not ? we need some sort of verification right ? so we will use `secret key` that we will pass along with the `webhook` and in Backend (StudyNotion) we will verify that `secret key` using `verifySignature controller`

- Capture payment means when the user clicks on the pay button on UI then a payment modal will open and ask for details and then order will be created and interaction between user's bank and razorpay account will be done and if successful, then pass the secret key along with the webhook and webhook will hit the API route (verify signature) and this will go to the StudyNotion Backend and there is also an secret key and both will be matched and if true then we can say that this is in Authorised State