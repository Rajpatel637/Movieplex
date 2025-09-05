# Email Verification Troubleshooting Guide

## Why You Might Not Be Receiving Email Verification

### 1. **Check Your Spam/Junk Folder**
- Gmail: Check "Promotions" and "Spam" tabs
- Outlook: Check "Junk Email" folder
- Yahoo: Check "Spam" folder

### 2. **Firebase Console Settings**
Check your Firebase project settings:

#### Authentication Templates
1. Go to: https://console.firebase.google.com/project/movieplex-b29e4
2. Navigate to **Authentication > Templates**
3. Check **Email address verification** template:
   - ✅ Should be enabled
   - ✅ Subject line should be set
   - ✅ Body content should be present
   - ✅ Action URL should be valid

#### Project Settings
1. Go to **Project Settings > General**
2. Check **Public-facing name**: Should be "MoviePlex" or similar
3. Check **Support email**: Should be a valid email address

#### Authorized Domains
1. Go to **Authentication > Settings > Authorized domains**
2. Make sure `localhost` is in the list for development
3. Add your production domain when you deploy

### 3. **Common Issues & Solutions**

#### Issue: No email sent at all
**Solution**: 
- Check Firebase Console for any error logs
- Verify your Firebase configuration is correct
- Ensure your project has email sending enabled

#### Issue: Email sent but not received
**Solution**:
- Check all email folders (inbox, spam, promotions)
- Try with a different email provider (Gmail, Yahoo, Outlook)
- Wait up to 10 minutes for delivery

#### Issue: Email verification link doesn't work
**Solution**:
- Check if the link has expired (usually 24 hours)
- Make sure you're clicking the link in the same browser
- Try requesting a new verification email

### 4. **Testing Steps**

1. **Register with a test email**
2. **Check browser console** for any errors
3. **Check Firebase Console** > Authentication > Users to see if user was created
4. **Wait 5-10 minutes** for email delivery
5. **Check all email folders** including spam
6. **Try with different email providers**

### 5. **Manual Testing Commands**

Open browser console and run:
```javascript
// Check if user needs verification
firebase.auth().currentUser?.emailVerified

// Get current user info
firebase.auth().currentUser

// Manually send verification email
firebase.auth().currentUser?.sendEmailVerification()
```

### 6. **Email Provider Specific Tips**

#### Gmail
- Check "All Mail" folder
- Look in "Promotions" tab
- Search for "movieplex" or "verification"

#### Outlook/Hotmail
- Check "Junk Email" folder
- Check "Focused" vs "Other" inbox tabs
- Look in "Deleted Items" (sometimes auto-filtered)

#### Yahoo
- Check "Spam" folder
- Look in "Bulk" folder
- Check email filters/rules

### 7. **Alternative Verification Method**

If email verification continues to fail, you can:
1. Skip email verification for development
2. Use a different email address
3. Check Firebase Console to manually verify users
4. Implement phone verification as backup

### 8. **Debug Information**

When registering, check browser console for these logs:
```
🔵 Starting user registration for: your-email@example.com
✅ User created successfully: [user-id]
🔄 Updating user profile...
✅ User profile updated
📧 Sending email verification to: your-email@example.com
✅ Email verification sent successfully
```

If you see "❌ Failed to send email verification", there's an issue with the email sending process.
