'use client';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';
export function ViewHistoryButton({
  className = '',
}: {
  className?: string;
}) {
  const router = useRouter();
  const handleViewHistory = () => {
    router.push('/certificates');
  };
  return (
    <Button
      onClick={handleViewHistory}
      variant="outline"
      className={`
        flex
        h-10
        items-center
        gap-2
        rounded-xl
        border
        border-[#003874]/20
        bg-white
        px-4
        font-semibold
        text-[#003874]
        shadow-sm
        transition-all
        duration-300
        hover:border-[#003874]
        hover:bg-[#eef5ff]
        hover:text-[#003874]
        ${className}
      `}
    >
      <History
        className="
          h-4
          w-4
          text-[#003874]
        "
      />
      <span>
        Ver historial
      </span>
    </Button>
  );
}