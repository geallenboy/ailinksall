'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, Home, LogIn, ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/layout';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';

export default function UnauthorizedPage() {
  const { isSignedIn } = useAuth();
  const t = useTranslations('errorPages.unauthorized');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <ShieldX className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {t('title')}
            </CardTitle>
            
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {t('description')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>{t('permissionDenied')}</strong>{t('message')}
                </p>
              </div>

              <div className="space-y-3">
                {isSignedIn ? (
                  <>
                    <Button 
                      asChild
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        {t('buttons.home')}
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <Link href="javascript:history.back()">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('buttons.back')}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      asChild
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Link href="/auth/signin">
                        <LogIn className="mr-2 h-4 w-4" />
                        {t('buttons.login')}
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        {t('buttons.home')}
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  {t('adminContact')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 