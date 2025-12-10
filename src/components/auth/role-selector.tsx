'use client';

import { cn } from '@/lib/utils';
import { Building, ShoppingCart, UserCheck, UserCog } from 'lucide-react';
import type { UserRole } from '@/lib/types';

const roles = [
  {
    value: 'vendor_admin' as UserRole,
    icon: UserCog,
    title: 'Vendor Admin',
    description: 'I manage a business/store.',
  },
   {
    value: 'vendor_staff' as UserRole,
    icon: ShoppingCart,
    title: 'Vendor Staff',
    description: 'I work for a business/store.',
  },
  {
    value: 'org_admin' as UserRole,
    icon: Building,
    title: 'Organization Admin',
    description: 'I manage an organization.',
  },
  {
    value: 'agent_staff' as UserRole,
    icon: UserCheck,
    title: 'Agent/Staff',
    description: 'I work for an organization.',
  },
];

interface RoleSelectorProps {
  value: UserRole | '';
  onValueChange: (value: UserRole) => void;
}

export function RoleSelector({ value, onValueChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
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
