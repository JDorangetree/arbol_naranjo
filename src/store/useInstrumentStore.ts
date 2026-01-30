import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Instrument, ALL_INSTRUMENTS, getPopularInstruments } from '../utils/instruments';

interface InstrumentState {
  // IDs de instrumentos seleccionados para tracking
  selectedInstrumentIds: string[];

  // Acciones
  addInstrument: (id: string) => void;
  removeInstrument: (id: string) => void;
  toggleInstrument: (id: string) => void;
  setSelectedInstruments: (ids: string[]) => void;
  resetToDefaults: () => void;

  // Getters
  getSelectedInstruments: () => Instrument[];
  isSelected: (id: string) => boolean;
}

// IDs de instrumentos por defecto (los más populares para empezar)
const DEFAULT_INSTRUMENT_IDS = [
  'ivv',      // S&P 500
  'vti',      // Total Market USA
  'vxus',     // Internacional
  'bnd',      // Bonos
  'vym',      // Dividendos
  'icolcap',  // Colombia
];

export const useInstrumentStore = create<InstrumentState>()(
  persist(
    (set, get) => ({
      selectedInstrumentIds: DEFAULT_INSTRUMENT_IDS,

      addInstrument: (id) => {
        const { selectedInstrumentIds } = get();
        if (!selectedInstrumentIds.includes(id)) {
          set({ selectedInstrumentIds: [...selectedInstrumentIds, id] });
        }
      },

      removeInstrument: (id) => {
        const { selectedInstrumentIds } = get();
        set({
          selectedInstrumentIds: selectedInstrumentIds.filter((i) => i !== id),
        });
      },

      toggleInstrument: (id) => {
        const { selectedInstrumentIds, addInstrument, removeInstrument } = get();
        if (selectedInstrumentIds.includes(id)) {
          removeInstrument(id);
        } else {
          addInstrument(id);
        }
      },

      setSelectedInstruments: (ids) => {
        set({ selectedInstrumentIds: ids });
      },

      resetToDefaults: () => {
        set({ selectedInstrumentIds: DEFAULT_INSTRUMENT_IDS });
      },

      getSelectedInstruments: () => {
        const { selectedInstrumentIds } = get();
        return ALL_INSTRUMENTS.filter((i) => selectedInstrumentIds.includes(i.id));
      },

      isSelected: (id) => {
        const { selectedInstrumentIds } = get();
        return selectedInstrumentIds.includes(id);
      },
    }),
    {
      name: 'instrument-storage',
    }
  )
);
