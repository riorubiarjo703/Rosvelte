/** Shared MMS motion classes (IntersectionObserver toggles `.visible`). */
/** Includes `reveal` for IntersectionObserver / hero scripts that toggle `.visible`. */
export const mmsReveal =
	'reveal opacity-0 translate-y-6 transition-[opacity,transform] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 [&.visible]:translate-y-0 [&.visible]:opacity-100';

export const mmsRevealShort =
	'reveal opacity-0 translate-y-4 transition-[opacity,transform] duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 [&.visible]:translate-y-0 [&.visible]:opacity-100';
