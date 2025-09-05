import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertTriangle, Star } from 'lucide-react';

const SpamToInboxGuide = ({ userEmail }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "📧 Check Your Gmail Spam Folder",
      content: (
        <div>
          <p>1. Go to Gmail and click <strong>"Spam"</strong> in the left sidebar</p>
          <p>2. Look for an email from <strong>Firebase</strong> or <strong>MoviePlex</strong></p>
          <p>3. Search for: <code>from:noreply verification</code></p>
        </div>
      )
    },
    {
      title: "✅ Mark as Not Spam",
      content: (
        <div>
          <p>1. <strong>Open the verification email</strong> in your Spam folder</p>
          <p>2. Click <strong>"Not Spam"</strong> or <strong>"Report Not Spam"</strong></p>
          <p>3. The email will move to your inbox automatically</p>
        </div>
      )
    },
    {
      title: "⭐ Add to Contacts (Important!)",
      content: (
        <div>
          <p>1. Open the verification email</p>
          <p>2. Click on the sender's email address</p>
          <p>3. Select <strong>"Add to Contacts"</strong></p>
          <p>4. Save: <code>noreply@movieplex-b29e4.firebaseapp.com</code></p>
        </div>
      )
    },
    {
      title: "🎯 Verify Your Email",
      content: (
        <div>
          <p>1. Click the <strong>verification link</strong> in the email</p>
          <p>2. Return to MoviePlex and click <strong>"I've Verified My Email"</strong></p>
          <p>3. Future emails will now reach your primary inbox! 🎉</p>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spam-guide"
    >
      <div className="spam-guide-header">
        <AlertTriangle className="icon warning-icon" />
        <h3>Email Found in Spam? Let's Fix That!</h3>
        <p>Follow these steps to ensure future emails reach your inbox:</p>
      </div>

      <div className="steps-container">
        {steps.map((stepData, index) => (
          <motion.div
            key={index}
            className={`step ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
            onClick={() => setStep(index)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="step-number">
              {index < step ? <CheckCircle className="check-icon" /> : index + 1}
            </div>
            <div className="step-content">
              <h4>{stepData.title}</h4>
              {index === step && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="step-details"
                >
                  {stepData.content}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="step-navigation">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="btn-secondary"
        >
          Previous
        </button>
        <span className="step-indicator">
          Step {step + 1} of {steps.length}
        </span>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          className="btn-primary"
        >
          {step === steps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>

      <div className="quick-tips">
        <Star className="icon" />
        <div>
          <h5>Quick Tip:</h5>
          <p>After marking as "Not Spam" and adding to contacts, all future MoviePlex emails will go directly to your primary inbox!</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SpamToInboxGuide;
