import React from 'react';

interface EmailTemplateProps {
  name: string;
  email: string;
  relationshipId: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  relationshipId
}) => (
  <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-lg">
    {/* Logo Section */}
    <div className="text-center mb-8">
      <div className="bg-purple-900 text-white text-2xl font-bold py-3 px-6 rounded-full inline-block">
        Wafaa
      </div>
    </div>

    {/* Main Content */}
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-purple-900 mb-6 text-center">
        💝 Discover Your Relationship Dynamics
      </h1>

      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          Hi there,
        </p>
        
        <p className="text-lg">
          <span className="font-semibold">{name}</span> has invited you to explore and strengthen your relationship through Wafaa's 
          advanced relationship analysis platform.
        </p>

        <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
          <h2 className="font-semibold text-xl mb-4 text-purple-900">
            Your Journey Together Includes:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">🎯</span>
              Personalized relationship insights based on your unique dynamics
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">💭</span>
              Guided conversation sessions for meaningful discussions
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">❤️</span>
              Understanding of love languages and communication styles
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">🔄</span>
              Regular relationship health check-ins and progress tracking
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 mb-6">
          <p className="font-medium">What happens next:</p>
          <ol className="list-decimal ml-4 mt-2 space-y-1">
            <li>Accept the invitation below</li>
            <li>Complete your personal profile</li>
            <li>Start your first guided conversation session</li>
            <li>Receive your initial relationship insights</li>
          </ol>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Personal invitation from {email}
          </p>
          <a 
            href={`${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${relationshipId}`}
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg transform transition-all hover:scale-105 duration-200"
          >
            Begin Your Relationship Journey →
          </a>
        </div>
      </div>
    </div>

    {/* Trust Section */}
    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-purple-600 text-lg mb-2">🔒</div>
          <p className="font-medium">Private & Secure</p>
          <p className="text-gray-500">Your conversations stay confidential</p>
        </div>
        <div>
          <div className="text-purple-600 text-lg mb-2">⭐</div>
          <p className="font-medium">Expert-Backed</p>
          <p className="text-gray-500">Based on relationship science</p>
        </div>
        <div>
          <div className="text-purple-600 text-lg mb-2">💫</div>
          <p className="font-medium">Personalized</p>
          <p className="text-gray-500">Tailored to your unique dynamic</p>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-8 text-center text-gray-500 space-y-4">
      <p className="text-sm">
        Questions? Our relationship specialists are here to help 24/7.
      </p>
      <div className="text-xs space-y-2">
        <p>© 2024 Wafaa. All rights reserved.</p>
        <p>
          Your privacy matters: This invitation was sent because {name} wants to strengthen your relationship.
          You can decline or ignore this invitation.
        </p>
      </div>
    </div>
  </div>
);

export default EmailTemplate;