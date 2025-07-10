'use client'

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4 w-full">
      <Card className="max-w-md w-1/4 shadow-lg rounded-xl overflow-hidden border-0 py-0">
        <CardHeader className="bg-blue-600 p-6">
          <div className="flex flex-col items-center space-y-2">
            <Lock className="h-8 w-8 text-white" />
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              OSM Login
            </CardTitle>
            <p className="text-blue-100 text-sm">
              Onscreen Evaluation Platform
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 focus-visible:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Link href="/forgot-password">
                  <Button 
                    variant="link" 
                    className="text-xs h-auto p-0 text-blue-600 hover:text-blue-800"
                  >
                    Forgot Password?
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 focus-visible:ring-blue-500"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Link href={'/admin'} className="w-full block">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              size={"default"}
            >
              Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}