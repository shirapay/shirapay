'use client';

import { cn } from '@/lib/utils';
import { Building, ShoppingCart, UserCheck } from 'lucide-react';
import type { UserRole } from '@/lib/types';

const roles = [
  {
    value: 'vendor' as UserRole,
    icon: ShoppingCart,
    title: 'Vendor',
    description: 'I provide goods/services.',
  },
  {
    value: 'agent' as UserRole,
    icon: UserCheck,
    title: 'Agent/Staff',
    description: 'I purchase on behalf of an organization.',
  },
  {
    value: 'admin' as UserRole,
    icon: Building,
    title: 'Organization Admin',
    description: 'I manage and approve funds.',
  },
];

interface RoleSelectorProps {
  value: UserRole | '';
  onValueChange: (value: UserRole) => void;
}

export function RoleSelector({ value, onValueChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {roles.map((role) => {
        const isSelected = value === role.value;
        return (
          <div
            key={role.value}
            onClick={() => onValueChange(role.value)}
            className={cn(
              'cursor-pointer rounded-lg border p-3 text-center transition-all',
              'hover:shadow-md hover:border-primary',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-muted-foreground/20 bg-transparent'
            )}
          >
            <role.icon
              className={cn(
                'mx-auto mb-2 h-7 w-7',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <p
              className={cn(
                'font-semibold text-sm',
                isSelected ? 'text-primary' : 'text-foreground'
              )}
            >
              {role.title}
            </p>
            <p className="text-xs text-muted-foreground">{role.description}</p>
          </div>
        );
      })}
    </div>
  );
}
