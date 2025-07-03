'use client';

import { useAuth } from '@/features/auth/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function UserSyncStatus() {
  const { 
    user, 
    dbUser, 
    syncStatus, 
    syncError, 
    isSynced, 
    isSyncing, 
    syncUserToDatabase,
    isLoaded,
    isSignedIn 
  } = useAuth();

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-gray-500">请先登录</p>
        </CardContent>
      </Card>
    );
  }

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />同步中</Badge>;
      case 'success':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />已同步</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />同步失败</Badge>;
      default:
        return <Badge variant="outline">待同步</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">用户同步状态</CardTitle>
        <CardDescription className="text-xs">
          Clerk 用户信息与数据库同步状态
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">同步状态</span>
          {getSyncStatusBadge()}
        </div>

        {syncError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            错误: {syncError}
          </div>
        )}

        <div className="space-y-2 text-xs">
          <div>
            <strong>Clerk 用户:</strong>
            <div className="ml-2 text-gray-600">
              <p>ID: {user?.id}</p>
              <p>邮箱: {user?.email}</p>
              <p>姓名: {user?.fullName || '未设置'}</p>
            </div>
          </div>

          {dbUser && (
            <div>
              <strong>数据库用户:</strong>
              <div className="ml-2 text-gray-600">
                <p>ID: {dbUser.id}</p>
                <p>邮箱: {dbUser.email}</p>
                <p>姓名: {dbUser.fullName || '未设置'}</p>
                <p>创建时间: {new Date(dbUser.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        <Button 
          size="sm" 
          variant="outline" 
          onClick={syncUserToDatabase}
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          手动同步
        </Button>
      </CardContent>
    </Card>
  );
} 