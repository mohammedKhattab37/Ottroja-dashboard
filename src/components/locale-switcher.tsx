"use client";

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const locales = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
];

export function LocaleSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  const currentLocale = locales.find(l => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('switchLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={`cursor-pointer ${
              loc.code === locale ? 'bg-accent' : ''
            }`}
          >
            <span className="font-medium">{loc.name}</span>
            {loc.code === locale && (
              <span className="ml-2 text-xs text-muted-foreground">
                {t('language')}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}