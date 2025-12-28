
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Adventure, TourPlan, SourceType, DayOfWeek, RideType } from './types';
import Header from './components/Header';
import AdventureList from './components/AdventureList';
import AdventureDetail from './components/AdventureDetail';
import AdventureForm from './components/AdventureForm';
import MagicGarageModal from './components/MagicGarageModal';
import TourPlanner from './components/TourPlanner';
import GearListModal from './components/GearListModal';
import RideModeModal from './components/RideModeModal';
import Modal from './components/Modal';

const INITIAL_ADVENTURES: Adventure[] = [
  {
    id: '1',
    title: 'Průsmyk Stelvio',
    description: 'Legendárních 48 zatáček v italských Alpách.',
    imageUrl: 'https://picsum.photos/seed/stelvio/800/450',
    sourceType: SourceType.MANUAL,
    waypoints: ['Bormio', 'Stelvio Pass', 'Prato allo Stelvio'],
    briefingSteps: ['Zkontrolujte brzdy.', 'Pozor na cyklisty v zatáčkách.', 'Vychutnejte si kávu na vrcholu.'],
    distanceKm: 25,
    durationHours: 1,
    difficulty: 'Expert',
    tags: ['alpy', 'zatáčky', 'itálie'],
    rating: 5,
  }
];

const App: React.FC = () => {
  const [adventures, setAdventures] = useState<Adventure[]>(() => {
    const saved = localStorage.getItem('adventures');
    return saved ? JSON.parse(saved) : INITIAL_ADVENTURES;
  });

  const [tourPlan, setTourPlan] = useState<TourPlan>(() => {
    const saved = localStorage.getItem('tourPlan');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [activeModal, setActiveModal] = useState<'detail' | 'form' | 'garage' | 'gear' | 'ride' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingAdventure, setEditingAdventure] = useState<Adventure | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'explore' | 'planner'>('explore');

  useEffect(() => { localStorage.setItem('adventures', JSON.stringify(adventures)); }, [adventures]);
  useEffect(() => { localStorage.setItem('tourPlan', JSON.stringify(tourPlan)); }, [tourPlan]);

  const handleSave = useCallback((adv: Adventure) => {
    setAdventures(prev => {
      const idx = prev.findIndex(r => r.id === adv.id);
      return idx > -1 ? (prev[idx] = adv, [...prev]) : [adv, ...prev];
    });
    setActiveModal(null);
  }, []);

  const handleUpdatePlan = useCallback((day: DayOfWeek, ride: RideType, id: string | null) => {
    setTourPlan(prev => ({ ...prev, [day]: { ...(prev[day] || {}), [ride]: id } }));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return adventures.filter(a => a.title.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)));
  }, [adventures, searchQuery]);

  const selected = useMemo(() => adventures.find(a => a.id === selectedId), [adventures, selectedId]);

  return (
    <div className="min-h-screen pb-20 text-stone-200">
      <Header 
        onAdd={() => { setEditingAdventure(null); setActiveModal('form'); }}
        onSearch={setSearchQuery}
        onOpenGarage={() => setActiveModal('garage')}
        currentView={currentView}
        onSetView={setCurrentView}
      />

      <main className="container mx-auto px-4 pt-6">
        {currentView === 'explore' ? (
          <AdventureList 
            adventures={filtered} 
            onSelect={(id) => { setSelectedId(id); setActiveModal('detail'); }} 
          />
        ) : (
          <TourPlanner 
            adventures={adventures}
            plan={tourPlan}
            onUpdate={handleUpdatePlan}
            onOpenGear={() => setActiveModal('gear')}
          />
        )}
      </main>

      {activeModal === 'detail' && selected && (
        <Modal onClose={() => setActiveModal(null)}>
          <AdventureDetail 
            adventure={selected}
            onEdit={() => { setEditingAdventure(selected); setActiveModal('form'); }}
            onDelete={() => setAdventures(p => p.filter(a => a.id !== selected.id))}
            onStartRide={() => setActiveModal('ride')}
          />
        </Modal>
      )}

      {activeModal === 'form' && (
        <Modal onClose={() => setActiveModal(null)}>
          <AdventureForm 
            editing={editingAdventure}
            onSave={handleSave}
            onClose={() => setActiveModal(null)}
          />
        </Modal>
      )}

      {activeModal === 'garage' && (
        <Modal onClose={() => setActiveModal(null)}>
          <MagicGarageModal 
            allAdventures={adventures}
            onSave={handleSave}
            onSelect={(id) => { setSelectedId(id); setActiveModal('detail'); }}
          />
        </Modal>
      )}

      {activeModal === 'gear' && (
        <Modal onClose={() => setActiveModal(null)}>
          <GearListModal 
            adventures={adventures.filter(a => 
              // Fix: cast Object.values to any[] or the actual type to resolve "unknown" error
              (Object.values(tourPlan) as any[]).some(d => d?.short === a.id || d?.long === a.id)
            )}
          />
        </Modal>
      )}

      {activeModal === 'ride' && selected && (
        <RideModeModal 
          adventure={selected}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default App;
