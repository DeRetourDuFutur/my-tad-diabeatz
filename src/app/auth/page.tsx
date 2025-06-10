'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { Button } from '@/components/ui/button';

type AuthMode = 'login' | 'register' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-black to-black">
      <div className="w-full max-w-md bg-black/50 p-8 rounded-lg border border-cyan-400 shadow-[0_0_15px_5px_rgba(0,255,255,0.5)]">
        <div className="mb-8">
          {mode === 'login' && <LoginForm />}
          {mode === 'register' && <RegisterForm />}
          {mode === 'reset' && <PasswordResetForm />}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Ou</span>
            </div>
          </div>

          <GoogleAuthButton />

          <div className="space-y-2">
            {mode === 'login' && (
              <>
                <Button
                  variant="link"
                  className="w-full text-cyan-400"
                  onClick={() => setMode('register')}
                >
                  Créer un compte
                </Button>
                <Button
                  variant="link"
                  className="w-full text-cyan-400"
                  onClick={() => setMode('reset')}
                >
                  Mot de passe oublié ?
                </Button>
              </>
            )}
            {(mode === 'register' || mode === 'reset') && (
              <Button
                variant="link"
                className="w-full text-cyan-400"
                onClick={() => setMode('login')}
              >
                Retour à la connexion
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}