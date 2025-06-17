'use client';

import { Container } from '@mantine/core';
import Image from 'next/image';

interface HeaderProps {
  clientName?: string;
}

export default function Header({ clientName }: HeaderProps) {
  return (
    <header className="bg-tmh-dark-header border-b border-gray-700 sticky top-0 z-50">
      <Container size="xl" className="py-4">
        <div>
          <Image 
            src="/images/tmh-logo-dark.svg" 
            alt="The Trademark Helpline" 
            width={180} 
            height={48} 
            priority
          />
        </div>
      </Container>
    </header>
  );
}