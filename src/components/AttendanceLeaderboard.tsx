
import React from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, Users } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentId: string;
  timestamp: string;
}

interface Student {
  id: string;
  name?: string;
}

interface LeaderboardEntry {
    studentId: string;
    name: string;
    totalAttendance: number;
    streak: number;
}

const AttendanceLeaderboard = ({ students, attendanceRecords }: { students: Student[], attendanceRecords: AttendanceRecord[] }) => {
    
    const calculateStats = (): LeaderboardEntry[] => {
        const stats: LeaderboardEntry[] = students.map(student => {
            const records = attendanceRecords
                .filter(r => r.studentId === student.id)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            // Total Attendance
            const totalAttendance = records.length;

            // Streak Calculation
            let streak = 0;
            if (records.length > 0) {
                let maxStreak = 1;
                let currentStreak = 1;
                for (let i = 1; i < records.length; i++) {
                    const prevDate = new Date(records[i-1].timestamp);
                    const currDate = new Date(records[i].timestamp);
                    
                    // Check if consecutive days (or same day, just count one)
                    const diffTime = currDate.getTime() - prevDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                        currentStreak++;
                    } else if (diffDays > 1) {
                        maxStreak = Math.max(maxStreak, currentStreak);
                        currentStreak = 1;
                    }
                }
                streak = Math.max(maxStreak, currentStreak);
            }

            return {
                studentId: student.id,
                name: student.name || 'Unknown',
                totalAttendance,
                streak
            };
        });

        // Sort by streak, then totalAttendance
        return stats.sort((a, b) => b.streak - a.streak || b.totalAttendance - a.totalAttendance);
    };

    const leaderboard = calculateStats();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mt-8"
        >
            <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                <Award className="size-6 text-[#F59E0B]" /> Attendance Leaderboard
            </h2>
            <div className="space-y-4">
                {leaderboard.slice(0, 5).map((entry, index) => (
                    <div key={entry.studentId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <span className={`text-lg font-bold ${index === 0 ? 'text-[#F59E0B]' : 'text-slate-400'}`}>#{index + 1}</span>
                            <span className="font-bold text-[#0F172A]">{entry.name}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1 text-blue-600"><TrendingUp className="size-4" /> {entry.streak} day streak</div>
                            <div className="flex items-center gap-1 text-slate-500"><Users className="size-4" /> {entry.totalAttendance} total</div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default AttendanceLeaderboard;
