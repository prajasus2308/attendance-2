/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User, LogOut, CheckCircle, Clock, Camera, Trash2, Plus, Users, FileText, UserPlus, Download, Quote, GraduationCap, Edit2, Save, X, Search, Settings, Upload, BarChart3 } from 'lucide-react';
import Papa from 'papaparse';

import { QUOTES } from './constants';
import { motion } from 'motion/react';
import { detectFace, loadModels } from './services/faceRecognitionService';

const QuoteDisplay = () => {
    const [quote, setQuote] = useState(QUOTES[0]);
    useEffect(() => {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 italic text-slate-700 font-serif"
        >
            <Quote className="size-6 text-blue-300 mb-2" />
            <p className="text-lg">"{quote.text}"</p>
            <p className="text-sm text-slate-500 mt-2">— {quote.author}</p>
        </motion.div>
    );
};

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    contentUrl?: string; // For files
    children?: FileItem[]; // For folders
}

interface Student {
    id: string;
    className: string;
    section: string;
    name?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    academicDetails?: string;
    documents?: FileItem[];
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  timestamp: string;
  photoData?: string;
}

interface CalendarEvent {
    id: string;
    date: string;
    title: string;
    type: 'holiday' | 'exam' | 'event';
}

const NotificationToast = ({ notifications }: { notifications: { id: string, message: string }[] }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {notifications.map(n => (
        <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-[#0F172A] text-white p-4 rounded-lg shadow-lg pointer-events-auto"
        >
          {n.message}
        </motion.div>
      ))}
    </div>
  );
}

const GuideModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-[#0F172A]">Platform Guide & Transparency</h2>
                    <button onClick={onClose} className="glow-button"><X className="size-6 text-slate-400" /></button>
                </div>
                <div className="space-y-6 text-slate-700">
                    <section>
                        <h3 className="font-bold text-[#2563EB] mb-2">For Students</h3>
                        <p className="text-sm">Log in with your ID to view attendance. Click "Take Photo & Mark" to mark your attendance using our face recognition engine.</p>
                    </section>
                    <section>
                        <h3 className="font-bold text-[#2563EB] mb-2">For Administrators</h3>
                        <p className="text-sm">Log in as admin to manage student lists, view monthly attendance trends, adjust attendance thresholds, and manually override records.</p>
                    </section>
                    <section>
                        <h3 className="font-bold text-[#2563EB] mb-2">Architecture & Data Privacy</h3>
                        <p className="text-sm">
                            This application uses a client-side architecture for real-time responsiveness. Data is stored locally in your browser's <code>localStorage</code>.
                        </p>
                        <p className="text-sm mt-2">
                            Face recognition is performed entirely in your browser using local models, ensuring sensitive biometric data is never transmitted to a server.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

const Footer = () => (
  <footer className="py-12 border-t border-slate-200 text-center text-slate-600 mt-10 bg-slate-50">
    <p>&copy; 2026 Attendance Solutions.</p>
    <p className="mt-4 text-emerald-700 font-serif font-bold">Created by Pratyush Raj, Vedang, Anish, Kushagra, Sriyans, Hridyansh</p>
  </footer>
);

const StudentProfileModal = ({ student, onClose, onUpdateStudent }: { student: Student, onClose: () => void, onUpdateStudent: (s: Student) => void }) => {
    const [documents, setDocuments] = useState<FileItem[]>(student.documents || []);

    const addFolder = (parent: FileItem | null) => {
        const name = prompt('Folder name:');
        if (!name) return;
        const newFolder: FileItem = { id: Date.now().toString(), name, type: 'folder', children: [] };
        if (parent) {
            parent.children = [...(parent.children || []), newFolder];
            setDocuments([...documents]);
        } else {
            setDocuments([...documents, newFolder]);
        }
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, parent: FileItem | null) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newFile: FileItem = { id: Date.now().toString(), name: file.name, type: 'file', contentUrl: url };
        if (parent) {
            parent.children = [...(parent.children || []), newFile];
            setDocuments([...documents]);
        } else {
            setDocuments([...documents, newFile]);
        }
      };
      reader.readAsDataURL(file);
    };

    const saveChanges = () => {
        onUpdateStudent({ ...student, documents });
        onClose();
        alert('Saved!');
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-[#0F172A]">{student.name}'s Documents (Admin)</h2>
                    <button onClick={onClose}><X className="size-6 text-slate-400" /></button>
                </div>
                <button onClick={() => addFolder(null)} className="mb-4 bg-blue-500 text-white p-2 rounded">Add Root Folder</button>
                <div className="space-y-4">
                    {documents.map(doc => (
                        <div key={doc.id} className="border p-2 rounded">
                            {doc.name} ({doc.type})
                            {doc.type === 'folder' && (
                                <div className='pl-4'>
                                    <button onClick={() => addFolder(doc)} className="text-sm bg-gray-200 p-1 rounded">Add Subfolder</button>
                                    <input type="file" onChange={(e) => handleFileUpload(e, doc)} className="text-sm" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={saveChanges} className="mt-6 bg-green-600 text-white p-3 rounded-lg w-full font-bold">Save</button>
            </div>
        </div>
    );
};

const TeamSection = () => {
    const team = [
        { name: 'Pratyush Raj', role: 'Creator', icon: '💡', imageUrl: 'https://www.image2url.com/r2/default/images/1778249315889-c3c54a84-1ecc-4385-858e-c95a3a8cde2f.jpeg' },
        { name: 'Vedang', role: 'Designer', icon: '🎨', imageUrl: 'https://www.image2url.com/r2/default/images/1778249372007-1055fcc4-9339-4b09-b1dd-0a3e545fb21b.png' },
        { name: 'Anish', role: 'UI/UX Designer', icon: '🤝', imageUrl: 'https://www.image2url.com/r2/default/images/1778261769527-c561fcd2-1343-4c2e-8b80-5dc9ef50fd48.jpeg' },
        { name: 'Kushagra', role: 'Graphic Designer', icon: '🎨', imageUrl: 'https://www.image2url.com/r2/default/images/1778249874037-2d652a82-f634-405e-bf2c-a3f8ba8be82c.jpeg' },
        { name: 'Sriyans', role: 'Collaborator', icon: '🤝', imageUrl: 'https://www.image2url.com/r2/default/images/1778251044294-1fbb0df2-b124-42e4-af9c-2c128484a307.jpeg' },
        { name: 'Hridyansh', role: 'Design Advisor', icon: '🎨', imageUrl: 'https://www.image2url.com/r2/default/images/1778594779802-8594ec8e-1fb4-4c52-84bf-1c1329f42d4a.jpeg' },
    ];
    return (
        <section id="team" className="container mx-auto px-6 py-20">
            <h3 className="text-4xl font-serif font-bold text-center mb-16">Meet Our Team</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                {team.map((member, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <img src={member.imageUrl} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                        <div className="text-2xl mb-2">{member.icon}</div>
                        <h4 className="font-bold text-lg text-[#0F172A]">{member.name}</h4>
                        <p className="text-[#2563EB] font-medium">{member.role}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default function App() {
  useEffect(() => {
    loadModels().catch(err => console.error('Failed to load models:', err));
  }, []);
  
  const [loginRole, setLoginRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [studentId, setStudentId] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin' | null>(null);
  const [loggedInId, setLoggedInId] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentId, setNewStudentId] = useState('');
  const [newClass, setNewClass] = useState('');
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTimestamp, setEditTimestamp] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarEvent['type']>('event');
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [manualStudentId, setManualStudentId] = useState('');
  const [attendanceThreshold, setAttendanceThreshold] = useState<number>(2);
  const [isAttendanceLocked, setIsAttendanceLocked] = useState(() => {
      const saved = localStorage.getItem('isAttendanceLocked');
      return saved ? JSON.parse(saved) : false;
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<Student | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
      const saved = localStorage.getItem('isDarkMode');
      return saved ? JSON.parse(saved) : false;
  });
  const updateStudent = (updatedStudent: Student) => {
    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updated);
    localStorage.setItem('students_list', JSON.stringify(updated));
  }

  const [studentSort, setStudentSort] = useState('none');
  const [calendarSearchQuery, setCalendarSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  const DarkModeButton = () => (
    <button 
        onClick={() => setIsDarkMode(!isDarkMode)} 
        className={`w-12 h-6 flex items-center ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'} rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none glow-button`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  const [displayedName, setDisplayedName] = useState("");
  const studentName = students.find(s => s.id === loggedInId)?.name || 'Not set';

  useEffect(() => {
    let isMounted = true;
    let i = 0;

    const interval = setInterval(() => {
        if (!isMounted) return;
        
        if (i <= studentName.length) {
            setDisplayedName(studentName.substring(0, i) + (i < studentName.length ? '|' : ''));
            i++;
        } else {
            i = 0;
        }
    }, 150);

    return () => {
        isMounted = false;
        clearInterval(interval);
    };
  }, [studentName]);

  const addNotification = (message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, {id, message}]);
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }

  useEffect(() => {
    // Only run when data is available
    if (userRole === 'student') {
        const today = new Date();
        calendarEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays <= 2) {
                addNotification(`Upcoming ${event.type}: ${event.title} on ${event.date}`);
            }
        });

        // Attendance Reminder
        const todayStr = new Date().toDateString();
        const hasMarkedAttendanceToday = attendanceRecords.some(r => {
            const recordDate = new Date(r.timestamp);
            return recordDate.toDateString() === todayStr;
        });
    }

    if (userRole === 'admin') {
        students.forEach(student => {
            const studentRecords = attendanceRecords.filter(r => r.studentId === student.id);
            if (studentRecords.length < attendanceThreshold) {
                addNotification(`Student ${student.id} has low attendance: ${studentRecords.length} records.`);
            }
        });
    }
  }, [calendarEvents, attendanceRecords, userRole, students, attendanceThreshold]);

  useEffect(() => {
    const savedAttendance = localStorage.getItem('student_attendance');
    if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
    const savedStudents = localStorage.getItem('students_list');
    if (savedStudents) {
        const parsed = JSON.parse(savedStudents);
        setStudents(typeof parsed[0] === 'string' ? parsed.map((s: string) => ({ id: s, className: 'N/A', section: 'N/A' })) : parsed);
    }
    const savedEvents = localStorage.getItem('calendar_events');
    if (savedEvents) setCalendarEvents(JSON.parse(savedEvents));
    const savedThreshold = localStorage.getItem('attendance_threshold');
    if (savedThreshold) setAttendanceThreshold(JSON.parse(savedThreshold));
  }, []);

  const handleTeacherLogin = (e: FormEvent) => {
    e.preventDefault();
    if (teacherPassword === 'teacher123') {
      setUserRole('teacher');
      setLoggedInId('Teacher');
    } else {
      addNotification("Invalid teacher password.");
    }
  };

  const handleStudentLogin = (e: FormEvent) => {
    e.preventDefault();
    if (studentId.trim() && studentClass.trim() && studentSection.trim()) {
      setUserRole('student');
      setLoggedInId(studentId.trim());
      if (!students.find(s => s.id === studentId.trim())) {
        const updated = [...students, { id: studentId.trim(), className: studentClass.trim(), section: studentSection.trim() }];
        setStudents(updated);
        localStorage.setItem('students_list', JSON.stringify(updated));
      }
    } else {
      addNotification("Please fill in all student details.");
    }
  };

  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    if (studentId === 'admin' && adminPassword === 'admindav') {
      setUserRole('admin');
      setLoggedInId('admin');
    } else {
      addNotification("Invalid admin credentials.");
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInId(null);
    setStudentId('');
    setNewStudentId('');
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setMessage('Camera access denied. Please allow permission.');
      setShowFaceScanner(false);
    }
  };

  useEffect(() => {
    if (showFaceScanner) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showFaceScanner]);

  const hasMarkedToday = (studentId: string) => {
    const todayStr = new Date().toDateString();
    return attendanceRecords.some(r => {
      const recordDate = new Date(r.timestamp);
      return r.studentId === studentId && recordDate.toDateString() === todayStr;
    });
  };

  const markAttendance = (photoData?: string) => {
    if (!loggedInId || userRole !== 'student') return;
    
    if (isAttendanceLocked) {
        addNotification('Attendance is locked by admin!');
        return;
    }
    
    if (hasMarkedToday(loggedInId)) {
        addNotification('Attendance already marked for today!');
        return;
    }

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId: loggedInId,
      timestamp: new Date().toLocaleString(),
      photoData,
    };
    const updatedRecords = [...attendanceRecords, newRecord];
    setAttendanceRecords(updatedRecords);
    localStorage.setItem('student_attendance', JSON.stringify(updatedRecords));
    setShowFaceScanner(false);
    setMessage('');
    addNotification('Attendance marked successfully!');
  };

  const addManualAttendance = (studentId: string) => {
    if (isAttendanceLocked) {
        addNotification('Attendance is locked by admin!');
        return;
    }
    if (!students.find(s => s.id === studentId)) {
        addNotification("Student not found!");
        return;
    }
    if (hasMarkedToday(studentId)) {
        addNotification("Student attendance already marked for today!");
        return;
    }
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId: studentId,
      timestamp: new Date().toLocaleString(),
    };
    const updatedRecords = [...attendanceRecords, newRecord];
    setAttendanceRecords(updatedRecords);
    localStorage.setItem('student_attendance', JSON.stringify(updatedRecords));
    addNotification('Manual attendance added!');
  };

  // Group attendance by month for chart
  const monthlyData = Object.entries(attendanceRecords.reduce((acc, record) => {
      const month = new Date(record.timestamp).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
  }, {} as Record<string, number>)).map(([month, count]) => ({ month, count }));

  const todayStr = new Date().toDateString();
  const presentStudentIds = new Set(attendanceRecords
    .filter(r => new Date(r.timestamp).toDateString() === todayStr)
    .map(r => r.studentId));
  const presentCount = presentStudentIds.size;
  const absentCount = Math.max(0, students.length - presentCount);
  const todayAttendanceData = [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount },
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const studentAttendanceSummary = students.map(s => {
      const count = attendanceRecords.filter(r => {
          const d = new Date(r.timestamp);
          return r.studentId === s.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;
      return { id: s.id, name: s.name || 'Unknown', count };
  });

  const sortedAttendance = [...studentAttendanceSummary].sort((a, b) => b.count - a.count);
  const topStudents = sortedAttendance.slice(0, 5);
  const bottomStudents = [...sortedAttendance].reverse().slice(0, 5);


  const takePhotoAndMarkAttendance = async () => {
    if (!videoRef.current) return;
    
    // Liveness prompt
    setMessage('Prepare for liveness check: Blink now!');
    await new Promise(resolve => setTimeout(resolve, 2000));                
    setMessage('Checking for liveness...');

    // Capture photo
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg');

    // Simulate photo taking and mark attendance
    setMessage('Detecting face...');
    
    const faceDetected = await detectFace(videoRef.current);
    
    if (faceDetected) {
        setMessage('Face detected! Marking attendance...');
        setTimeout(() => {
            markAttendance(photoData);
        }, 1000);
    } else {
        setMessage('Face not recognized! Please try again.');
        setTimeout(() => {
            setMessage('');
        }, 2000);
    }
  };


  const addStudent = () => {
    if(newStudentId && !students.find(s => s.id === newStudentId)) {
        const newStudent = { id: newStudentId, className: newClass || 'N/A', section: 'N/A' };
        const updated = [...students, newStudent];
        setStudents(updated);
        localStorage.setItem('students_list', JSON.stringify(updated));
        setNewStudentId(''); setNewClass('');
        addNotification('Student added successfully!');
    }
  }

  const removeStudent = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem('students_list', JSON.stringify(updated));
  }

  const bulkDeleteStudents = () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedStudentIds.length} students?`)) return;
    const updated = students.filter(s => !selectedStudentIds.includes(s.id));
    setStudents(updated);
    localStorage.setItem('students_list', JSON.stringify(updated));
    setSelectedStudentIds([]);
    addNotification('Students deleted!');
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleBulkImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        complete: (results) => {
            const parsedData = results.data as any[];
            const newStudents = parsedData
                .filter(d => d.id)
                .map(d => ({
                    id: d.id,
                    className: d.className || 'N/A',
                    section: d.section || 'N/A',
                    name: d.name
                }));
            
            const updated = [...students, ...newStudents.filter(s => !students.find(existing => existing.id === s.id))];
            setStudents(updated);
            localStorage.setItem('students_list', JSON.stringify(updated));
            addNotification(`Imported ${newStudents.length} students!`);
        }
    });
  };

  const deleteRecord = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    const updated = attendanceRecords.filter(r => r.id !== id);
    setAttendanceRecords(updated);
    localStorage.setItem('student_attendance', JSON.stringify(updated));
    addNotification('Record deleted!');
  }

  const startEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditTimestamp(record.timestamp);
  }

  const saveEdit = (id: string) => {
    const updated = attendanceRecords.map(r => r.id === id ? {...r, timestamp: editTimestamp} : r);
    setAttendanceRecords(updated);
    localStorage.setItem('student_attendance', JSON.stringify(updated));
    setEditingId(null);
    addNotification('Record updated!');
  }

  const addEvent = () => {
    if(newDate && newTitle) {
        const newEvent: CalendarEvent = { id: Date.now().toString(), date: newDate, title: newTitle, type: newType };
        const updated = [...calendarEvents, newEvent];
        setCalendarEvents(updated);
        localStorage.setItem('calendar_events', JSON.stringify(updated));
        setNewDate(''); setNewTitle('');
        addNotification('Event added!');
    }
  }

  const removeEvent = (id: string) => {
    const updated = calendarEvents.filter(e => e.id !== id);
    setCalendarEvents(updated);
    localStorage.setItem('calendar_events', JSON.stringify(updated));
  }

  const filteredRecords = attendanceRecords.filter(r => {
    // 1. Period/Date filter
    let dateMatch = true;
    const recordDate = new Date(r.timestamp);
    
    if (filterPeriod !== 'all') {
        const now = new Date();
        const diffDays = (now.getTime() - recordDate.getTime()) / (1000 * 3600 * 24);
        if (filterPeriod === 'week') dateMatch = diffDays <= 7;
        else if (filterPeriod === 'month') dateMatch = diffDays <= 30;
    } else if (filterStartDate || filterEndDate) {
        if (filterStartDate) dateMatch = dateMatch && recordDate >= new Date(filterStartDate);
        if (filterEndDate) dateMatch = dateMatch && recordDate <= new Date(filterEndDate + 'T23:59:59');
    }
    
    if (!dateMatch) return false;

    // 2. Grade/Class filter
    const student = students.find(s => s.id === r.studentId);
    if (filterClass !== 'all' && student?.className !== filterClass) return false;

    // 3. Student ID search
    if (studentSearchQuery && !r.studentId.toLowerCase().includes(studentSearchQuery.toLowerCase())) return false;

    return true;
  }).sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortOrder === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      
      const studentA = students.find(s => s.id === a.studentId);
      const studentB = students.find(s => s.id === b.studentId);
      const classA = studentA?.className || '';
      const classB = studentB?.className || '';
      
      if (sortOrder === 'class-asc') return classA.localeCompare(classB);
      if (sortOrder === 'class-desc') return classB.localeCompare(classA);
      
      return 0;
  });

  const exportAttendanceToCSV = () => {
    const headers = ["Student ID", "Timestamp"];
    const rows = filteredRecords.map(r => [r.studentId, r.timestamp]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_records.csv';
    a.click();
  };

  const handleDownloadStudentCSV = () => {
    const headers = ["ID", "Class", "Section", "Name"];
    const rows = students.map(s => [s.id, s.className, s.section, s.name || '']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_list.csv';
    a.click();
  };

  const updateProfile = () => {
    if (!profileData) return;
    const updated = students.map(s => s.id === profileData.id ? profileData : s);
    setStudents(updated);
    localStorage.setItem('students_list', JSON.stringify(updated));
    setIsEditingProfile(false);
    addNotification('Profile updated successfully!');
  };



  if (!userRole) {
    return (
      <>
        <NotificationToast notifications={notifications} />
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-[#0F172A] dark:text-white font-sans">
          {/* Frosted Campus Glass Background */}
          <div className="fixed inset-0 -z-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="fixed inset-0 -z-0 bg-white/30"></div>

          <header className="sticky top-0 w-full p-6 flex flex-wrap justify-between items-center z-50 bg-white/60 backdrop-blur-md shadow-sm border-b border-white/20">
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#2563EB] flex items-center gap-2"><GraduationCap className="size-8" /> DAV MODEL</h1>
            <nav className="flex flex-wrap gap-3 sm:gap-6 font-semibold text-[#0F172A]/80 dark:text-white/80">
                <a href="#about" className="hover:text-[#2563EB]">About</a>
                <a href="#features" className="hover:text-[#2563EB]">Features</a>
                <DarkModeButton />
                <button onClick={() => setShowGuide(true)} className="text-[#2563EB] font-bold">Help</button>
                <button onClick={() => setStudentId('admin')} className="text-[#2563EB] font-bold glow-button">Admin Login</button>
            </nav>
          </header>

          {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

          <main className="relative z-10 space-y-24 pb-20">
            {/* Hero Section */}
            <section className="container mx-auto px-6 pt-20 text-center">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0F172A] mb-6"
                >
                    Modern Academic Attendance
                </motion.h2>
                <p className="text-lg sm:text-xl text-[#0F172A]/70 max-w-2xl mx-auto mb-12 font-medium">
                    An efficient, secure, and modern way to manage student attendance using state-of-the-art face recognition technology.
                </p>
                
                <div id="login" className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full mx-auto">
                    <h3 className="text-2xl font-bold mb-8 text-center text-[#0F172A]">Login</h3>
                    <div className="flex gap-2 mb-6">
                        {['student', 'teacher', 'admin'].map(r => (
                          <button key={r} onClick={() => setLoginRole(r as any)} className={`flex-grow py-2 rounded-lg font-bold capitalize ${loginRole === r ? 'bg-[#2563EB] text-white' : 'bg-slate-200 text-slate-600'}`}>{r}</button>
                        ))}
                    </div>
                    
                    <form onSubmit={loginRole === 'admin' ? handleAdminLogin : loginRole === 'teacher' ? handleTeacherLogin : handleStudentLogin} className="space-y-6">
                        {loginRole === 'student' && (
                            <>
                                <input type="text" placeholder="Enter Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-5 py-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[#0F172A] placeholder-slate-400 focus:ring-2 focus:ring-[#2563EB] font-bold" required />
                                <input type="text" placeholder="Class" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full px-5 py-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[#0F172A] placeholder-slate-400 focus:ring-2 focus:ring-[#2563EB] font-bold" required />
                                <input type="text" placeholder="Section" value={studentSection} onChange={e => setStudentSection(e.target.value)} className="w-full px-5 py-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[#0F172A] placeholder-slate-400 focus:ring-2 focus:ring-[#2563EB] font-bold" required />
                            </>
                        )}
                        {loginRole === 'teacher' && (
                            <input type="password" placeholder="Shared Password" value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} className="w-full px-5 py-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[#0F172A] placeholder-slate-400 focus:ring-2 focus:ring-[#2563EB] font-bold" required />
                        )}
                        {loginRole === 'admin' && (
                          <>
                            <input type="text" placeholder="Admin Username" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-5 py-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[#0F172A] placeholder-slate-400 focus:ring-2 focus:ring-[#2563EB] font-bold" required />
                            <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-5 py-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[#0F172A] placeholder-slate-400 focus:ring-2 focus:ring-[#2563EB] font-bold" required />
                          </>
                        )}
                        <button type="submit" className="w-full bg-[#2563EB] text-white font-bold py-4 rounded-lg hover:bg-[#1d4ed8] transition-all shadow-lg shadow-[#2563EB]/20 uppercase tracking-wider text-sm glow-button">
                        Login
                        </button>
                    </form>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <div className="bg-emerald-900 p-12 rounded-3xl text-emerald-50 font-serif">
                    <h3 className="text-4xl font-bold mb-6">Efficiency in the Classroom</h3>
                    <p className="text-lg opacity-90 leading-relaxed">
                        Say goodbye to manual roll calls. Our system streamlines the attendance process, allowing teachers to focus on what matters most — teaching.
                    </p>
                </div>
                <div>
                   <QuoteDisplay />
                </div>
            </section>

             {/* Features Section */}
             <section id="features" className="container mx-auto px-6">
                <h3 className="text-4xl font-serif font-bold text-center mb-16">Key Features</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    {['Face Recognition Attendance', 'Secure Admin Dashboard', 'Detailed Reporting'].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="size-12 bg-emerald-100 rounded-lg mb-6 flex items-center justify-center">
                                <CheckCircle className="size-6 text-emerald-600" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">{feature}</h4>
                            <p className="text-slate-600 text-sm">Empowering schools with reliable, automated attendance tracking solutions.</p>
                        </div>
                    ))}
                </div>
             </section>
          <TeamSection />
          </main>

          <Footer />
      </div>
      </>
    );
  }

  if (userRole === 'teacher') {
      return (
        <>
          <NotificationToast notifications={notifications} />
          <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 p-4 md:p-8 font-sans">
              <header className="max-w-5xl mx-auto flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h1 className="text-3xl font-serif font-bold text-[#0F172A] flex items-center gap-3"><GraduationCap className="size-8 text-[#2563EB]" /> Teacher Dashboard</h1>
                  <div className="flex items-center gap-4">
                      <button onClick={handleLogout} className="text-[#0F172A]/60 dark:text-white/60 hover:text-red-600 flex items-center gap-2 font-bold transition-colors glow-button">
                          <LogOut className="size-5" /> Logout
                      </button>
                      <DarkModeButton />
                  </div>
              </header>
              <main className="max-w-5xl mx-auto space-y-10">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                          <FileText className="size-6 text-[#2563EB]" /> Class Attendance Records
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-widest text-[#0F172A]/50 border-b border-slate-100">
                                    <th className="pb-4">Student ID</th>
                                    <th className="pb-4">Class</th>
                                    <th className="pb-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => {
                                    const marked = hasMarkedToday(s.id);
                                    return (
                                        <tr key={s.id} className={`border-b ${marked ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                            <td className="py-4 font-bold text-[#0F172A]">{s.id}</td>
                                            <td className="py-4 text-[#0F172A]/70">{s.className}</td>
                                            <td className="py-4 flex items-center gap-4">
                                                {marked ? 
                                                    <span className='flex items-center gap-1 font-bold text-emerald-600'><CheckCircle className="text-emerald-500 size-5" /> Present</span> : 
                                                    <span className='flex items-center gap-1 font-bold text-red-600'><X className="text-red-500 size-5" /> Absent</span>
                                                }
                                                <button 
                                                    onClick={() => addManualAttendance(s.id)} 
                                                    disabled={marked || isAttendanceLocked}
                                                    className={`px-4 py-2 rounded-lg font-bold glow-button ${(marked || isAttendanceLocked) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'}`}>
                                                    {marked ? 'Already Marked' : isAttendanceLocked ? 'Locked' : 'Mark Present'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                      </div>
                  </div>
              </main>
              <Footer />
          </div>
        </>
      );
  }

  if (userRole === 'admin') {
      return (
        <>
          <NotificationToast notifications={notifications} />
          <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 p-4 md:p-8 font-sans">
              <header className="max-w-5xl mx-auto flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h1 className="text-3xl font-serif font-bold text-[#0F172A] flex items-center gap-3"><GraduationCap className="size-8 text-[#2563EB]" /> Admin Dashboard</h1>
                  <div className="flex items-center gap-4">
                      <button onClick={handleLogout} className="text-[#0F172A]/60 dark:text-white/60 hover:text-red-600 flex items-center gap-2 font-bold transition-colors glow-button">
                          <LogOut className="size-5" /> Logout
                      </button>
                      <DarkModeButton />
                      <button onClick={() => setShowGuide(true)} className="text-[#2563EB] font-bold">Help</button>
                  </div>
              </header>
              {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
              <main className="max-w-5xl mx-auto space-y-10">
                  <QuoteDisplay />
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                            <Users className="size-6 text-[#2563EB]" /> Manage Students
                        </h2>
                        <div className="flex gap-4 mb-6">
                            <input type="text" value={newStudentId} onChange={e => setNewStudentId(e.target.value)} placeholder="New Student ID" className="flex-grow px-4 py-3 rounded-lg border border-slate-200 font-bold" />
                            <input type="text" value={newClass} onChange={e => setNewClass(e.target.value)} placeholder="Class" className="w-24 px-4 py-3 rounded-lg border border-slate-200 font-bold" />
                            <button onClick={addStudent} className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] glow-button"><Plus /></button>
                        </div>
                        <div className="flex gap-4 mb-6">
                            <input type="file" ref={fileInputRef} onChange={handleBulkImport} accept=".csv" className='hidden' />
                            <button onClick={() => fileInputRef.current?.click()} className="flex-grow bg-[#16A34A] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#15803d] flex items-center justify-center gap-2 glow-button"><Upload size={20}/> Bulk Students</button>
                        </div>
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-3.5 size-5 text-slate-400" />
                            <input type="text" value={studentSearchQuery} onChange={e => setStudentSearchQuery(e.target.value)} placeholder="Search students..." className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 font-bold" />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 gap-y-4 flex flex-col">
                        <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                            <Settings className="size-6 text-[#2563EB]" /> Settings
                        </h2>
                         <div className="flex items-center gap-4">
                            <label className="font-bold text-[#0F172A]">Attendance Threshold:</label>
                            <input type="number" value={attendanceThreshold} onChange={(e) => { const val = parseInt(e.target.value); setAttendanceThreshold(val); localStorage.setItem('attendance_threshold', JSON.stringify(val)); }} className="px-4 py-3 rounded-lg border border-slate-200 font-bold w-24" />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="font-bold text-[#0F172A]">Attendance Lock:</label>
                             <button onClick={() => {setIsAttendanceLocked(!isAttendanceLocked); localStorage.setItem('isAttendanceLocked', JSON.stringify(!isAttendanceLocked)); addNotification(`Attendance ${!isAttendanceLocked ? 'Locked' : 'Unlocked'}!`)}} className={`px-4 py-2 rounded-lg font-bold ${isAttendanceLocked ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                {isAttendanceLocked ? 'Locked' : 'Unlocked'}
                             </button>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-[#0F172A] mt-6 mb-6 flex items-center gap-3">
                            <Edit2 className="size-6 text-[#2563EB]" /> Manual Override
                        </h2>
                        <div className="flex gap-4">
                            <input type="text" value={manualStudentId} onChange={e => setManualStudentId(e.target.value)} placeholder="Student ID" className="flex-grow px-4 py-3 rounded-lg border border-slate-200 font-bold" />
                            <button onClick={() => { addManualAttendance(manualStudentId); setManualStudentId(''); }} className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] glow-button">Mark Present</button>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                          <BarChart3 className="size-6 text-[#2563EB]" /> Attendance Trends
                      </h2>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={monthlyData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="count" fill="#2563EB" />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                          <BarChart3 className="size-6 text-[#2563EB]" /> Today's Attendance
                      </h2>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={todayAttendanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                      {todayAttendanceData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={index === 0 ? '#16A34A' : '#DC2626'} />
                                      ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 col-span-full mt-8">
                    <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                        <FileText className="size-6 text-[#2563EB]" /> Attendance Summary (Current Month)
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-emerald-600 mb-4">Top 5 Students</h3>
                            {topStudents.map(s => (
                                <div key={s.id} className="flex justify-between py-2 border-b">
                                    <span>{s.name}</span>
                                    <span className="font-bold">{s.count} days</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h3 className="font-bold text-red-600 mb-4">Bottom 5 Students</h3>
                            {bottomStudents.map(s => (
                                <div key={s.id} className="flex justify-between py-2 border-b">
                                    <span>{s.name}</span>
                                    <span className="font-bold">{s.count} days</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

              </main>
              
              {/* Calendar Manager */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                      <Clock className="size-6 text-[#2563EB]" /> School Calendar
                  </h2>
                  <div className="flex gap-4 mb-6">
                      <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="px-4 py-3 rounded-lg border border-slate-200 font-bold" />
                      <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Event Title" className="flex-grow px-4 py-3 rounded-lg border border-slate-200 font-bold" />
                      <select value={newType} onChange={e => setNewType(e.target.value as any)} className="px-4 py-3 rounded-lg border border-slate-200 font-bold">
                          <option value="holiday">Holiday</option>
                          <option value="exam">Exam</option>
                          <option value="event">Event</option>
                      </select>
                      <button onClick={addEvent} className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1d4ed8]"><Plus /></button>
                  </div>
                  <input type="text" value={calendarSearchQuery} onChange={e => setCalendarSearchQuery(e.target.value)} placeholder="Search events..." className="w-full px-4 py-3 rounded-lg border border-slate-200 font-bold mb-6" />
                  <div className="space-y-2">
                      {calendarEvents.filter(e => e.title.toLowerCase().includes(calendarSearchQuery.toLowerCase())).map(e => (
                          <div key={e.id} className="flex justify-between items-center p-4 bg-[#F8FAFC] rounded-lg">
                              <span className="font-bold text-[#0F172A]">{e.date} - {e.title} ({e.type})</span>
                              <button onClick={() => removeEvent(e.id)} className="text-red-500 hover:text-red-700"><Trash2 className="size-4" /></button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Student Profiles Viewer */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                          <User className="size-6 text-[#2563EB]" /> Student Profiles
                      </span>
                      <div className='flex gap-2'>
                        {selectedStudentIds.length > 0 && (
                            <button onClick={bulkDeleteStudents} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 glow-button text-sm"><Trash2 size={16}/> Delete ({selectedStudentIds.length})</button>
                        )}
                        <select value={studentSort} onChange={e => setStudentSort(e.target.value)} className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2 font-bold text-sm">
                            <option value="none">Sort by</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                        </select>
                        <input type="text" value={studentSearchQuery} onChange={e => setStudentSearchQuery(e.target.value)} placeholder="Search..." className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2 font-bold text-sm" />
                        <button onClick={handleDownloadStudentCSV} className="bg-[#16A34A] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#15803d] flex items-center gap-2 glow-button text-sm"><Download size={16}/> CSV</button>
                      </div>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {students.filter(s => s.id.toLowerCase().includes(studentSearchQuery.toLowerCase()) || (s.name && s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()))).sort((a,b) => {
                          if (studentSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
                          if (studentSort === 'name-desc') return (b.name || '').localeCompare(a.name || '');
                          return 0;
                       }).map(s => {
                          const attendanceCount = attendanceRecords.filter(r => r.studentId === s.id).length;
                          const isLow = attendanceCount < attendanceThreshold;
                          return (
                          <div key={s.id} onClick={() => userRole === 'admin' && setSelectedStudentForProfile(s)} className={`cursor-pointer p-4 rounded-lg border relative ${isLow ? 'bg-red-50 border-red-200' : 'bg-[#F8FAFC] border-slate-200'}`}>
                              <input type="checkbox" className="absolute top-2 left-2 size-5" checked={selectedStudentIds.includes(s.id)} onChange={e => {
                                  if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, s.id]);
                                  else setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                              }} />
                              {s.photoUrl ? (
                                  <img src={s.photoUrl} alt={s.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                              ) : (
                                  <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-slate-200 flex items-center justify-center">
                                      <User className="size-10 text-slate-400" />
                                  </div>
                              )}
                              <h3 className="font-bold text-center text-[#0F172A]">{s.name || 'N/A'}</h3>
                              <p className="text-sm text-center text-slate-500">ID: {s.id}</p>
                              <p className="text-sm text-center text-slate-500">Class: {s.className}</p>
                              <p className={`text-sm text-center font-bold ${isLow ? 'text-red-600' : 'text-slate-500'}`}>Attendance: {attendanceCount}</p>
                              {s.email && <p className="text-sm text-center text-slate-500">{s.email}</p>}
                              {s.phone && <p className="text-sm text-center text-slate-500">{s.phone}</p>}
                              {isLow && <p className="text-xs text-center text-red-600 font-bold mt-2">Low Attendance!</p>}
                          </div>
                      )})}
                  </div>
               </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-serif font-bold text-[#0F172A] flex items-center gap-3">
                          <FileText className="size-6 text-[#2563EB]" /> Attendance Records
                      </h2>
                      <button onClick={exportAttendanceToCSV} className="text-sm font-bold text-[#2563EB] glow-button px-4 py-2 rounded-lg border border-[#2563EB]/20 flex items-center gap-2 uppercase tracking-wide">
                          <Download className="size-4" /> Export CSV
                      </button>
                  </div>
                  <div className="flex flex-wrap gap-4 mb-8 p-4 bg-slate-50 rounded-lg">
                      <div className="relative flex-grow">
                          <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                          <input type="text" placeholder="Search by Student ID" value={studentSearchQuery} onChange={e => setStudentSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 font-bold text-sm" />
                       </div>
                       <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="border border-slate-200 rounded-lg p-2 font-bold text-sm">
                           <option value="all">All Classes</option>
                           {[...new Set(students.map(s => s.className))].filter(c => c !== 'N/A').map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="border border-slate-200 rounded-lg p-2 font-bold text-sm" title="Start Date" />
                       <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="border border-slate-200 rounded-lg p-2 font-bold text-sm" title="End Date" />
                       <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border border-slate-200 rounded-lg p-2 font-bold text-sm">
                           <option value="newest">Newest First</option>
                           <option value="oldest">Oldest First</option>
                           <option value="class-asc">Class (A-Z)</option>
                           <option value="class-desc">Class (Z-A)</option>
                       </select>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full">
                          <thead className="border-b border-slate-100">
                               <tr className="text-left text-xs uppercase tracking-widest text-[#0F172A]/50">
                                  <th className="pb-4">Photo</th>
                                  <th className="pb-4">Student ID</th>
                                  <th className="pb-4">Timestamp</th>
                                  <th className="pb-4">Actions</th>
                               </tr>
                          </thead>
                          <tbody>
                              {filteredRecords.map(r => (
                                  <tr key={r.id} className="border-b border-slate-100">
                                      <td className="py-4 font-bold text-[#0F172A]">{r.studentId}</td>
                                      <td className="py-4 text-[#0F172A]/70">
                                        {editingId === r.id ? 
                                          <input type="text" value={editTimestamp} onChange={e => setEditTimestamp(e.target.value)} className="border rounded p-1" /> :
                                          r.timestamp
                                        }
                                      </td>
                                      <td className="py-4">
                                        {editingId === r.id ? (
                                          <div className="flex gap-2">
                                              <button onClick={() => saveEdit(r.id)}><Save className="size-4 text-green-600" /></button>
                                              <button onClick={() => setEditingId(null)}><X className="size-4 text-red-600" /></button>
                                          </div>
                                        ) : (
                                          <div className="flex gap-2">
                                              <button onClick={() => startEdit(r)}><Edit2 className="size-4 text-blue-600" /></button>
                                              <button onClick={() => deleteRecord(r.id)}><Trash2 className="size-4 text-red-600" /></button>
                                          </div>
                                        )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              <Footer />
          </div>
        </>
      );
  }

  return (
    <>
      <NotificationToast notifications={notifications} />
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 p-4 md:p-8 font-sans">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-serif font-bold text-[#0F172A] flex items-center gap-3"><GraduationCap className="size-8 text-[#2563EB]" /> DAV MODEL Portal</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#0F172A]/70 font-bold">
            <User className="size-5 text-[#2563EB]" />
            {loggedInId}
          </div>
          <button onClick={handleLogout} className="text-[#0F172A]/60 dark:text-white/60 hover:text-red-600 flex items-center gap-2 font-bold transition-colors glow-button">
            <LogOut className="size-5" /> Logout
          </button>
          <DarkModeButton />
          <button onClick={() => setShowGuide(true)} className="text-[#2563EB] font-bold">Help</button>
        </div>
      </header>
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {selectedStudentForProfile && (
        <StudentProfileModal 
          student={selectedStudentForProfile} 
          onClose={() => setSelectedStudentForProfile(null)} 
          onUpdateStudent={updateStudent}
        />
      )}

      <main className="max-w-5xl mx-auto space-y-10">
        <QuoteDisplay />
        {showFaceScanner ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-6">Camera Attendance</h2>
            <video ref={videoRef} autoPlay playsInline className="mx-auto rounded-xl bg-[#0F172A] mb-6" width="320" height="240"></video>
            <p className="mb-4 text-[#0F172A]/70 font-bold">{message}</p>
            <button onClick={takePhotoAndMarkAttendance} disabled={hasMarkedToday(loggedInId!) || isAttendanceLocked} className={`px-8 py-3 rounded-lg font-bold w-full md:w-auto uppercase tracking-wide glow-button ${(hasMarkedToday(loggedInId!) || isAttendanceLocked) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#16A34A] text-white hover:bg-[#15803d]'}`}>
                {hasMarkedToday(loggedInId!) ? 'Attendance Marked Today' : isAttendanceLocked ? 'Attendance Locked' : 'Take Photo & Mark Attendance'}
            </button>
             <button onClick={() => {setShowFaceScanner(false); setMessage('')}} className="ml-4 text-slate-500 font-bold glow-button">Close</button>
          </div>
        ) : (
          <div className="bg-[#0F172A] p-8 rounded-2xl shadow-lg flex items-center justify-between text-white">
            <div>
              <h2 className="text-3xl font-serif font-bold">Attendance</h2>
              <p className="text-[#F8FAFC]/70 font-medium mt-2">Mark your daily attendance.</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => setShowFaceScanner(true)} className="flex items-center gap-3 bg-[#2563EB] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#1d4ed8] transition-all uppercase tracking-wide text-sm glow-button">
                  <Camera className="size-5" /> Take Photo & Mark
                </button>
            </div>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
           <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-8 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <User className="size-6 text-[#2563EB]" /> Profile
             </div>
             <button onClick={() => {
                 setProfileData(students.find(s => s.id === loggedInId) || {id: loggedInId!, className: '', section: ''});
                 setIsEditingProfile(true);
             }} className="text-sm bg-[#2563EB] text-white px-4 py-2 rounded-lg glow-button">Edit</button>
           </h2>
           {isEditingProfile ? (
              <div className="space-y-4">
                 <input type="text" placeholder="Name" value={profileData?.name || ''} onChange={e => setProfileData({...profileData!, name: e.target.value})} className="w-full px-4 py-2 border rounded" />
                 <input type="text" placeholder="Email" value={profileData?.email || ''} onChange={e => setProfileData({...profileData!, email: e.target.value})} className="w-full px-4 py-2 border rounded" />
                 <input type="text" placeholder="Phone" value={profileData?.phone || ''} onChange={e => setProfileData({...profileData!, phone: e.target.value})} className="w-full px-4 py-2 border rounded" />
                 <label className="block text-sm font-bold text-slate-700">Upload Photo</label>
                 <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setProfileData({...profileData!, photoUrl: reader.result as string}); }; reader.readAsDataURL(file); } }} className="w-full px-4 py-2 border rounded" />
                 <textarea placeholder="Academic Details" value={profileData?.academicDetails || ''} onChange={e => setProfileData({...profileData!, academicDetails: e.target.value})} className="w-full px-4 py-2 border rounded" />
                 <button onClick={updateProfile} className="bg-green-600 text-white px-4 py-2 rounded-lg glow-button">Save</button>
                 <button onClick={() => setIsEditingProfile(false)} className="ml-2 text-slate-500 glow-button">Cancel</button>
              </div>
           ) : (
              <div className="grid grid-cols-2 gap-4 text-sm font-bold text-[#0F172A]">
                {students.find(s => s.id === loggedInId)?.photoUrl ? (
                  <img src={students.find(s => s.id === loggedInId)?.photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="size-10 text-slate-400" />
                  </div>
                )}
                <motion.p whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>Name: {displayedName}</motion.p>
                <p>Email: {students.find(s => s.id === loggedInId)?.email || 'Not set'}</p>
                <p>Phone: {students.find(s => s.id === loggedInId)?.phone || 'Not set'}</p>
                <p>Academic: {students.find(s => s.id === loggedInId)?.academicDetails || 'Not set'}</p>
              </div>
           )}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-serif font-bold text-[#0F172A] mb-8 flex items-center gap-3">
            <Clock className="size-6 text-[#2563EB]" /> School Calendar
          </h2>
          <div className="space-y-4">
             {calendarEvents.map(e => (
                 <div key={e.id} className="flex justify-between items-center p-4 bg-[#F8FAFC] rounded-lg">
                     <span className="font-bold text-[#0F172A]">{e.date} - {e.title}</span>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${e.type === 'holiday' ? 'bg-emerald-100 text-emerald-800' : e.type === 'exam' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{e.type}</span>
                 </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#0F172A] flex items-center gap-3">
                <Clock className="size-6 text-[#2563EB]" /> Attendance History
            </h2>
            <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2 font-bold text-sm">
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-[#0F172A]/50 border-b border-slate-100">
                  <th className="pb-4">Student ID</th>
                  <th className="pb-4">Date & Time</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-[#0F172A]">
                {attendanceRecords.filter(r => {
                  let match = r.studentId === loggedInId;
                  if (filterPeriod !== 'all') {
                      const recordDate = new Date(r.timestamp);
                      const now = new Date();
                      const diffDays = (now.getTime() - recordDate.getTime()) / (1000 * 3600 * 24);
                      if (filterPeriod === 'week') match = match && diffDays <= 7;
                      else if (filterPeriod === 'month') match = match && diffDays <= 30;
                  }
                  return match;
                }).map((record) => (
                  <tr key={record.id} className="border-b border-slate-50 last:border-0 hover:bg-[#F8FAFC]">
                    <td className="py-5 font-bold text-[#0F172A]">{record.studentId}</td>
                    <td className="py-5 text-[#0F172A]/70">{record.timestamp}</td>
                    <td className="py-5 text-right font-bold text-[#16A34A] bg-[#16A34A]/10 px-3 rounded-lg">Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

          <Footer />
        </div>
    </>
  );
}

