'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Code, TrendingUp, GraduationCap, Building, DollarSign, Search } from 'lucide-react';
import type { UserRole } from '../types';

interface UserRoleSelectorProps {
  selectedRole?: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roleConfig: Record<UserRole, {
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}> = {
  developer: {
    label: '开发者',
    icon: <Code className="w-4 h-4" />,
    description: '关注技术实现、工具和开发趋势',
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  marketer: {
    label: '营销人员',
    icon: <TrendingUp className="w-4 h-4" />,
    description: '专注市场营销、用户增长和商业策略',
    color: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  student: {
    label: '学生',
    icon: <GraduationCap className="w-4 h-4" />,
    description: '学习新知识、掌握新技能',
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
  },
  business: {
    label: '企业决策者',
    icon: <Building className="w-4 h-4" />,
    description: '关注商业机会、战略决策和行业发展',
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
  },
  investor: {
    label: '投资人',
    icon: <DollarSign className="w-4 h-4" />,
    description: '评估投资机会、分析市场趋势',
    color: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  researcher: {
    label: '研究员',
    icon: <Search className="w-4 h-4" />,
    description: '深度研究、学术分析和前沿探索',
    color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
  },
};

export function UserRoleSelector({ selectedRole, onRoleChange }: UserRoleSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  if (selectedRole && !showSelector) {
    const config = roleConfig[selectedRole];
    return (
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={config.color}>
                {config.icon}
                <span className="ml-1">{config.label}</span>
              </Badge>
              <span className="text-sm text-gray-600">
                AI已为您定制个性化内容
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSelector(true)}
            >
              切换身份
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          选择您的身份
        </CardTitle>
        <p className="text-sm text-gray-600">
          选择最符合您背景的身份，AI将为您提供个性化的洞察和行动建议
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([role, config]) => (
            <Button
              key={role}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-start gap-2 hover:border-blue-300 ${
                selectedRole === role ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => {
                onRoleChange(role);
                setShowSelector(false);
              }}
            >
              <div className="flex items-center gap-2 w-full">
                {config.icon}
                <span className="font-medium text-sm">{config.label}</span>
              </div>
              <p className="text-xs text-gray-500 text-left leading-relaxed">
                {config.description}
              </p>
            </Button>
          ))}
        </div>
        
        {!selectedRole && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>为什么需要选择身份？</strong> 不同身份的人关注点不同。选择后，AI会为您优先显示最相关的洞察和行动建议。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 