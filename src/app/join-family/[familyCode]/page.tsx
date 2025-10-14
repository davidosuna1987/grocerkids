import JoinFamily from '@/app/views/join-family';

export default function JoinFamilyPage({ params }: { params: { familyCode: string  } }) {
  return <JoinFamily familyCode={params.familyCode} />
}
