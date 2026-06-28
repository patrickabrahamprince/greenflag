interface Guest {
  name: string;
  age: number;
  photos: string[];
}

interface ReviewGuestHeaderProps {
  guest: Guest;
  submissionCount: number;
}

export function ReviewGuestHeader({ guest, submissionCount }: ReviewGuestHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-[#F0EDE9] flex items-center justify-center overflow-hidden shrink-0">
        {guest.photos?.[0] ? (
          <img
            src={guest.photos[0]}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-avatar.svg';
            }}
          />
        ) : (
          <span className="text-2xl font-medium text-ink">
            {guest.name?.charAt(0)}
          </span>
        )}
      </div>
      <div>
        <h1 className="font-['Playfair_Display'] text-2xl text-ink">
          {guest.name}, {guest.age}
        </h1>
        <p className="text-[#8E8E93] text-sm">{submissionCount}/8 tasks completed</p>
      </div>
    </div>
  );
}
