// Google Authentication Debug Utilities
// Run these commands in your browser console to debug auth issues

// 1. Check current authentication state
window.debugAuth = () => {
  console.log('🔍 === AUTHENTICATION DEBUG INFO ===');
  console.log('Firebase Auth Current User:', firebase.auth().currentUser);
  console.log('Local Storage Auth:', localStorage.getItem('firebase:authUser:AIzaSyC_cJz0YI6VKmlI8OBTaNnXEW8LBtbCzLQ:[DEFAULT]'));
  console.log('Session Storage:', Object.keys(sessionStorage).filter(key => key.includes('firebase')));
  console.log('Context User State:', window.authContextUser);
  console.log('==========================================');
};

// 2. Clear all authentication data
window.clearAuthData = () => {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear Firebase auth
  firebase.auth().signOut();
  
  // Clear local storage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('firebase') || key.includes('google')) {
      localStorage.removeItem(key);
      console.log('Cleared localStorage:', key);
    }
  });
  
  // Clear session storage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('firebase') || key.includes('google')) {
      sessionStorage.removeItem(key);
      console.log('Cleared sessionStorage:', key);
    }
  });
  
  console.log('✅ Authentication data cleared. Refresh the page.');
};

// 3. Test Google Sign-in directly
window.testGoogleSignIn = async () => {
  console.log('🧪 Testing Google Sign-in directly...');
  
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await firebase.auth().signInWithPopup(provider);
    console.log('✅ Direct Google Sign-in Success:', result.user);
    console.log('User Email:', result.user.email);
    console.log('User Name:', result.user.displayName);
    console.log('Provider:', result.additionalUserInfo.providerId);
  } catch (error) {
    console.error('❌ Direct Google Sign-in Error:', error);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
  }
};

// 4. Monitor auth state changes
window.monitorAuthState = () => {
  console.log('👀 Monitoring auth state changes...');
  
  const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
    console.log('🔄 Auth State Change Detected:', {
      timestamp: new Date().toISOString(),
      user: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        providers: user.providerData.map(p => p.providerId)
      } : null
    });
  });
  
  console.log('✅ Monitoring started. Call stopMonitoring() to stop.');
  window.stopMonitoring = unsubscribe;
};

// Instructions
console.log('🛠️ === GOOGLE AUTH DEBUG UTILITIES LOADED ===');
console.log('Available commands:');
console.log('- debugAuth(): Check current auth state');
console.log('- clearAuthData(): Clear all auth data');
console.log('- testGoogleSignIn(): Test Google sign-in directly');
console.log('- monitorAuthState(): Monitor auth state changes');
console.log('=====================================');

// Auto-run debug info on load
if (typeof firebase !== 'undefined') {
  setTimeout(() => {
    window.debugAuth();
  }, 1000);
}
