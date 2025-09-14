import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { WorkoutSession, Routine } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import ShareIcon from './icons/ShareIcon';

interface RoutineLogbookProps {
    sessions: WorkoutSession[];
}

type DateRange = '1W' | '1M' | '3M' | '6M' | '1Y';

const RoutineLogbook: React.FC<RoutineLogbookProps> = ({ sessions }) => {
    const [routines] = useLocalStorage<Routine[]>('routines', []);
    const [selectedRoutineId, setSelectedRoutineId] = useState('all');
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('1M');
    const [openShareMenu, setOpenShareMenu] = useState<string | null>(null);

    const filteredSessions = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        switch (selectedDateRange) {
            case '1W': startDate.setDate(now.getDate() - 7); break;
            case '1M': startDate.setMonth(now.getMonth() - 1); break;
            case '3M': startDate.setMonth(now.getMonth() - 3); break;
            case '6M': startDate.setMonth(now.getMonth() - 6); break;
            case '1Y': startDate.setFullYear(now.getFullYear() - 1); break;
        }

        return sessions
            .filter(session => {
                const sessionDate = new Date(session.date);
                const routineMatch = selectedRoutineId === 'all' || session.routineId === selectedRoutineId;
                const dateMatch = sessionDate >= startDate;
                return routineMatch && dateMatch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sessions, selectedRoutineId, selectedDateRange]);
    
    const dateRanges: DateRange[] = ['1W', '1M', '3M', '6M', '1Y'];

    const downloadFile = (file: File) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpenShareMenu(null);
    };

    const shareFile = async (file: File, session: WorkoutSession) => {
        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: `Workout: ${session.routineName}`,
                    text: `Check out my workout from ${new Date(session.date).toLocaleDateString()}`,
                    files: [file],
                });
                setOpenShareMenu(null);
            } catch (error) {
                console.error('Share failed:', error);
                setOpenShareMenu(null);
            }
        } else {
            downloadFile(file);
        }
    };

    const handleSharePDF = (session: WorkoutSession) => {
        const doc = new jsPDF();
        let y = 30;

        doc.setFontSize(20);
        doc.text(session.routineName, 14, 22);

        doc.setFontSize(12);
        doc.text(`Date: ${new Date(session.date).toLocaleDateString()}`, 14, y);
        y += 10;

        session.exercises.forEach(ex => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(ex.exerciseName, 14, y);
            y += 7;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            ex.sets.forEach((set, index) => {
                if (y > 280) { doc.addPage(); y = 20; }
                doc.text(`- Set ${index + 1}: ${set.weight} kg x ${set.reps} reps`, 20, y);
                y += 7;
            });
            y += 5; // Extra space between exercises
        });

        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], `${session.routineName}_${new Date(session.date).toISOString().split('T')[0]}.pdf`, { type: 'application/pdf' });
        shareFile(pdfFile, session);
    };

    const handleShareCSV = (session: WorkoutSession) => {
        let csvContent = 'Exercise,Set,Weight (kg),Reps\n';
        session.exercises.forEach(ex => {
            ex.sets.forEach((set, index) => {
                csvContent += `"${ex.exerciseName}",${index + 1},${set.weight},${set.reps}\n`;
            });
        });

        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const csvFile = new File([csvBlob], `${session.routineName}_${new Date(session.date).toISOString().split('T')[0]}.csv`, { type: 'text/csv' });
        shareFile(csvFile, session);
    };

    return (
        <div className="space-y-4">
             <h2 className="text-xl font-bold text-center">Workout Logbook</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <select value={selectedRoutineId} onChange={(e) => setSelectedRoutineId(e.target.value)} className="w-full sm:w-1/2 bg-surface p-2 rounded-lg border border-transparent focus:border-primary">
                    <option value="all">All Routines</option>
                    {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <div className="w-full sm:w-1/2 bg-surface rounded-lg flex p-1">
                    {dateRanges.map(range => (
                        <button key={range} onClick={() => setSelectedDateRange(range)} className={`flex-1 text-sm py-1 rounded-md transition-colors ${selectedDateRange === range ? 'bg-primary text-white font-semibold' : 'text-text-secondary hover:bg-gray-700'}`}>
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {filteredSessions.length > 0 ? (
                <div className="space-y-4">
                    {filteredSessions.map(session => (
                        <div key={session.id} className="bg-surface p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-primary">{session.routineName}</h3>
                                    <p className="text-sm text-text-secondary">{new Date(session.date).toLocaleDateString()}</p>
                                </div>
                                <div className="relative">
                                    <button onClick={() => setOpenShareMenu(openShareMenu === session.id ? null : session.id)} className="p-2 rounded-full hover:bg-gray-700">
                                        <ShareIcon className="w-5 h-5" />
                                    </button>
                                    {openShareMenu === session.id && (
                                        <div className="absolute right-0 mt-2 w-40 bg-background border border-gray-700 rounded-lg shadow-xl z-10">
                                            <button onClick={() => handleSharePDF(session)} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface">Export as PDF</button>
                                            <button onClick={() => handleShareCSV(session)} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface">Export as CSV</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {session.exercises.map(ex => (
                                    <div key={ex.exerciseId}>
                                        <p className="font-semibold text-text-primary">{ex.exerciseName}</p>
                                        <div className="pl-4 text-sm text-text-secondary">
                                            {ex.sets.map((set, index) => (
                                                <p key={set.id}>{`Set ${index + 1}: ${set.weight} kg x ${set.reps} reps`}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-text-secondary py-10 bg-surface rounded-lg">
                    <p>No workouts found for the selected filters.</p>
                </div>
            )}
        </div>
    );
};

export default RoutineLogbook;
