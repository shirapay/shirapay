'use client';

import React, { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShiraPayLogo } from '@/components/icons';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Info } from 'lucide-react';
import { RoleSelector } from '@/components/auth/role-selector';
import type { UserProfile, UserRole } from '@/lib/types';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.65 0-8.42-3.82-8.42-8.5s3.77-8.5 8.42-8.5c2.53 0 4.22.98 5.17 1.89l2.76-2.76C18.44 1.43 15.75 0 12.48 0 5.88 0 .04 5.88.04 12.5s5.84 12.5 12.44 12.5c3.23 0 5.93-1.1 7.9-3.05 2.05-2.02 2.6-4.86 2.6-7.72 0-.6-.05-1.18-.15-1.72H12.48z" />
  </svg>
);

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole | ''>('');
  const [linkingId, setLinkingId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);


  const createAndSaveUser = async (user: import('firebase/auth').User, name: string, role: UserRole) => {
      const isStaff = role === 'agent_staff' || role === 'vendor_staff';
      
      const userProfile: Omit<UserProfile, 'createdAt'> = {
        uid: user.uid,
        name,
        email: user.email!,
        role,
        organizationId: role === 'agent_staff' ? linkingId : null,
        linkedAdminId: role === 'vendor_staff' ? linkingId : null,
        approvalStatus: isStaff ? 'PENDING' : 'VERIFIED',
        kycStatus: role === 'vendor_admin' ? 'NOT_STARTED' : 'NA',
      };
      await setDoc(doc(firestore, 'users', user.uid), {
          ...userProfile,
          createdAt: serverTimestamp(),
      });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast({ title: 'Login Successful', description: "Welcome back! Redirecting..." });
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast({ title: "Passwords do not match", variant: 'destructive' });
      return;
    }
    if (!signupRole) {
      toast({ title: "Please select a role", variant: 'destructive' });
      return;
    }
    const isStaff = signupRole === 'agent_staff' || signupRole === 'vendor_staff';
    if (isStaff && !linkingId) {
        toast({ title: `Please provide the required ID for your role.`, variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      await createAndSaveUser(userCredential.user, signupName, signupRole);
      toast({ title: 'Sign Up Successful', description: 'Your account has been created. Redirecting...' });
    } catch (error: any) {
      toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Google Sign-In Successful', description: "Redirecting..." });
    } catch (error: any) {
      toast({ title: 'Google Sign-In Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!loginEmail) {
        toast({ title: "Please enter your email", description: "We need your email to send a password reset link.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        await sendPasswordResetEmail(auth, loginEmail);
        toast({ title: "Password Reset Email Sent", description: "Please check your inbox for instructions." });
    } catch (error: any) {
         toast({ title: "Password Reset Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <ShiraPayLogo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">ShiraPay</span>
          </Link>
        </div>

        <Card className="shadow-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>Sign in to your ShiraPay account.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input id="email-login" type="email" placeholder="m@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={isLoading} />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-login">Password</Label>
                      <Button type="button" variant="link" className="h-auto p-0 text-sm text-primary hover:underline" onClick={handlePasswordReset}>
                        Forgot Password?
                      </Button>
                    </div>
                    <Input id="password-login" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={isLoading} />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </CardContent>
              </form>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                  Sign in with Google
                </Button>
              </CardFooter>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl">Create an Account</CardTitle>
                  <CardDescription>Choose your role to get started.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>What's your role?</Label>
                    <RoleSelector value={signupRole} onValueChange={(value) => setSignupRole(value as UserRole)} />
                  </div>

                  {(signupRole === 'agent_staff' || signupRole === 'vendor_staff') && (
                     <div className="grid gap-2">
                      <Label htmlFor="linking-id">
                        {signupRole === 'agent_staff' ? 'Organization ID' : "Vendor Admin's User ID"}
                      </Label>
                      <Input
                        id="linking-id"
                        placeholder={signupRole === 'agent_staff' ? 'Enter 8-digit Org ID...' : "Enter manager's ID..."}
                        value={linkingId}
                        onChange={(e) => setLinkingId(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Alert variant="default" className="mt-2">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Action Required</AlertTitle>
                        <AlertDescription>
                            Your account will be pending until your administrator approves it.
                        </AlertDescription>
                     </Alert>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="name-signup">Full Name</Label>
                    <Input id="name-signup" placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} required disabled={isLoading} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" type="email" placeholder="m@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required disabled={isLoading} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required disabled={isLoading} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password-signup">Confirm Password</Label>
                    <Input id="confirm-password-signup" type="password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required disabled={isLoading} />
                  </div>
                  
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardContent>
              </form>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                </div>
              </div>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                  Sign up with Google
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
