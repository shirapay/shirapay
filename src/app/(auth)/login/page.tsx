'use client';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { RoleSelector } from '@/components/auth/role-selector';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';


// Placeholder for Google Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.65 0-8.42-3.82-8.42-8.5s3.77-8.5 8.42-8.5c2.53 0 4.22.98 5.17 1.89l2.76-2.76C18.44 1.43 15.75 0 12.48 0 5.88 0 .04 5.88.04 12.5s5.84 12.5 12.44 12.5c3.23 0 5.93-1.1 7.9-3.05 2.05-2.02 2.6-4.86 2.6-7.72 0-.6-.05-1.18-.15-1.72H12.48z"
        />
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic will be added in Step 3
    console.log('Login attempt with:', { loginEmail, loginPassword });
    toast({ title: "Login functionality pending." });
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
    // Logic will be added in Step 3
    console.log('Signup attempt with:', { signupName, signupEmail, signupPassword, signupRole });
    toast({ title: "Sign up functionality pending." });
  };
  
  const handleGoogleSignIn = () => {
    // Logic will be added in Step 3
    console.log('Google Sign-In attempt');
    toast({ title: "Google Sign-In functionality pending." });
  }


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
                        <CardDescription>
                            Sign in to your ShiraPay account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="email-login">Email</Label>
                        <Input
                            id="email-login"
                            type="email"
                            placeholder="m@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password-login">Password</Label>
                                <Link
                                    href="#"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <Input
                                id="password-login"
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
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
                        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                           <GoogleIcon className="mr-2 h-4 w-4" /> Sign in with Google
                        </Button>
                    </CardFooter>
                </TabsContent>
                <TabsContent value="signup">
                    <form onSubmit={handleSignUp}>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl">Create an Account</CardTitle>
                        <CardDescription>
                        Choose your role to get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name-signup">Full Name</Label>
                            <Input
                            id="name-signup"
                            placeholder="John Doe"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                            disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email-signup">Email</Label>
                            <Input
                            id="email-signup"
                            type="email"
                            placeholder="m@example.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password-signup">Password</Label>
                            <Input
                            id="password-signup"
                            type="password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password-signup">Confirm Password</Label>
                            <Input
                            id="confirm-password-signup"
                            type="password"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            />
                        </div>

                         <div className="grid gap-2">
                           <Label>What's your role?</Label>
                           <RoleSelector value={signupRole} onValueChange={(value) => setSignupRole(value as UserRole)}/>
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
                       <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                            <GoogleIcon className="mr-2 h-4 w-4" /> Sign up with Google
                        </Button>
                    </CardFooter>
                </TabsContent>
                </Tabs>
            </Card>
        </div>
    </div>
  );
}
