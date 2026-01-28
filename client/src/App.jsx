import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
  Search,
  TrendingUp,
  Star,
  Play,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const API_URL = '/api';

const ACTIVITY_DATA = [
  { day: 'Mon', hours: 2, lessons: 3 },
  { day: 'Tue', hours: 5, lessons: 7 },
  { day: 'Wed', hours: 3, lessons: 4 },
  { day: 'Thu', hours: 8, lessons: 10 },
  { day: 'Fri', hours: 6, lessons: 8 },
  { day: 'Sat', hours: 4, lessons: 5 },
  { day: 'Sun', hours: 9, lessons: 12 },
];

function App() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [view, setView] = useState('hero'); // hero, courses, dashboard
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState([]);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [publicStats, setPublicStats] = useState(null);

  const progressDistribution = [
    { range: '0-25%', count: analytics.filter(s => s.averageProgress <= 25).length },
    { range: '26-50%', count: analytics.filter(s => s.averageProgress > 25 && s.averageProgress <= 50).length },
    { range: '51-75%', count: analytics.filter(s => s.averageProgress > 50 && s.averageProgress <= 75).length },
    { range: '76-100%', count: analytics.filter(s => s.averageProgress > 75).length },
  ];

  useEffect(() => {
    if (view === 'hero') {
      fetchPublicStats();
    }
    if (view === 'dashboard' && user) {
      if (user.role === 'admin' || user.role === 'instructor') {
        fetchAnalytics();
      } else if (user.role === 'student') {
        fetchMyEnrollments();
      }
    }
  }, [view, user]);

  const fetchMyEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/enrollments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentEnrollments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  };

  const fetchPublicStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/analytics/public-stats`);
      setPublicStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch public stats:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/analytics/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isSignUp ? '/auth/register' : '/auth/login';
    const payload = isSignUp
      ? { name: formData.name, email: formData.email, password: formData.password, role: formData.role }
      : { email: formData.email, password: formData.password };

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      setIsLoginModalOpen(false);
      setView('dashboard');
      if (res.data.user.role === 'admin' || res.data.user.role === 'instructor') {
        setTimeout(fetchAnalytics, 100);
      } else if (res.data.user.role === 'student') {
        setTimeout(fetchMyEnrollments, 100);
      }
    } catch (err) {
      console.error('Auth Error Details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || (isSignUp ? 'Registration failed' : `Login failed (${err.message})`));
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/users/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const handleEnrollmentStatusUpdate = async (enrollmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/enrollments/${enrollmentId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to update enrollment status:', err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setView('hero');
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            < BookOpen color="white" size={24} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            AI <span className="gradient-text">LMS</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a href="#" className="nav-link" onClick={() => setView('hero')}>Home</a>
          <a href="#" className="nav-link" onClick={() => setView('courses')}>Courses</a>
          {user ? (
            <>
              <a href="#" className="nav-link" onClick={() => setView('dashboard')}>Dashboard</a>
              <button
                onClick={logout}
                style={{ marginLeft: '32px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              style={{ marginLeft: '32px' }}
              onClick={() => {
                setIsSignUp(false);
                setIsLoginModalOpen(true);
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="container">
        <AnimatePresence mode="wait">
          {view === 'hero' && (
            <motion.section
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hero-section"
            >
              <h1 className="hero-title">Experience the Future of <br />Learning with AI</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 40px' }}>
                Join the next generation of education. Personalized paths, immersive content, and real-world results.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => setView('courses')}>
                  Browse Courses <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
                </button>
                <button className="btn-outline" onClick={() => {
                  setIsSignUp(true);
                  setIsLoginModalOpen(true);
                }}>Create Account</button>
              </div>

              <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div className="glass card">
                  <div style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}><TrendingUp size={24} /></div>
                  <h3 style={{ marginBottom: '8px' }}>Adaptive Learning</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Hyper-personalized paths powered by <strong>GPT-4</strong>. Our AI analyzes your progress in real-time to adjust course difficulty and content depth.
                  </p>
                </div>

                <div className="glass card">
                  <div style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}><Users size={24} /></div>
                  <h3 style={{ marginBottom: '8px' }}>Expert Instructors</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {publicStats?.instructors ? publicStats.instructors.slice(0, 2).map((inst, i) => (
                      <div key={i} style={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{inst.name}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>— {inst.specialty}</span>
                      </div>
                    )) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Learn from industry professionals with years of experience.</p>
                    )}
                  </div>
                </div>

                <div className="glass card">
                  <div style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}><Star size={24} /></div>
                  <h3 style={{ marginBottom: '8px' }}>Gamified Results</h3>
                  <div style={{ fontSize: '0.9rem' }}>
                    {publicStats ? (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-secondary)' }}>
                          {publicStats.totalPoints.toLocaleString()}+ Points
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          earned by {publicStats.studentCount} students worldwide.
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>Gain badges and level up as you complete challenges.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {view === 'courses' && (
            <motion.section
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2>Explore <span className="gradient-text">Courses</span></h2>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
                  <input type="text" placeholder="Search courses..." style={{ paddingLeft: '40px', width: '300px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="glass card">
                    <div style={{
                      height: '180px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{ opacity: 0.2 }}><Play size={48} /></div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 800 }}>Development</span>
                    <h3 style={{ margin: '8px 0' }}>AI-Driven Backend Systems {i}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Master the art of building scalable AI architectures using modern stacks.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700 }}>$49.99</span>
                      <button style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {view === 'dashboard' && user && (
            <motion.section
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ marginBottom: '40px' }}>
                <h1>Welcome Back, <span className="gradient-text">{user.name}</span></h1>
                <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your learning journey.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div className="glass card">
                    <h3 style={{ marginBottom: '20px' }}>Current Progress</h3>
                    {studentEnrollments.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {studentEnrollments.map(enrollment => (
                          <div key={enrollment.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                              <span style={{ fontWeight: 600 }}>{enrollment.course?.title}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{enrollment.progress}%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                              {enrollment.status === 'pending' ? (
                                <div style={{ width: '100%', height: '100%', background: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ fontSize: '8px', color: '#facc15', fontWeight: 800 }}>AWAITING APPROVAL</span>
                                </div>
                              ) : (
                                <div style={{
                                  width: `${enrollment.progress}%`,
                                  height: '100%',
                                  background: 'var(--accent-gradient)',
                                  borderRadius: '4px',
                                  transition: 'width 0.5s ease-out'
                                }}></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        <BookOpen size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
                        <p>No active enrollments found. Enroll in a course to see your progress!</p>
                      </div>
                    )}
                  </div>

                  <div className="glass card">
                    <h3 style={{ marginBottom: '20px' }}>Learning Activity</h3>
                    <div style={{ height: '200px', width: '100%', marginTop: '20px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ACTIVITY_DATA}>
                          <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(23, 23, 23, 0.8)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              backdropFilter: 'blur(10px)'
                            }}
                            itemStyle={{ color: 'white' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="var(--accent-primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorHours)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {(user.role === 'admin' || user.role === 'instructor') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                      <div className="glass card">
                        <h3 style={{ marginBottom: '20px' }}>Class Progress Distribution</h3>
                        <div style={{ height: '220px', width: '100%', marginTop: '20px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={progressDistribution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis
                                dataKey="range"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                              />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                              <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                contentStyle={{
                                  background: 'rgba(23, 23, 23, 0.8)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '8px',
                                  backdropFilter: 'blur(10px)'
                                }}
                              />
                              <Bar
                                dataKey="count"
                                fill="var(--accent-secondary)"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="glass card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} className="gradient-text" />
                            Student Overview
                          </h3>
                          <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: 'var(--text-muted)' }}>
                            {analytics.length} Students Total
                          </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ textAlign: 'left', paddingBottom: '15px', fontWeight: 600 }}>Student</th>
                                <th style={{ textAlign: 'left', paddingBottom: '15px', fontWeight: 600 }}>Points</th>
                                <th style={{ textAlign: 'left', paddingBottom: '15px', fontWeight: 600 }}>Avg. Progress</th>
                                <th style={{ textAlign: 'left', paddingBottom: '15px', fontWeight: 600 }}>Top Course</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.map(student => (
                                <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                  <td style={{ padding: '15px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '10px' }}>
                                        {student.avatar ? <img src={student.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : student.name[0]}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px 0' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>{student.points}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Lvl {student.level}</span>
                                  </td>
                                  <td style={{ padding: '15px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                        <div style={{ width: `${student.averageProgress}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '2px' }}></div>
                                      </div>
                                      <span style={{ fontSize: '0.8rem' }}>{student.averageProgress}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{student.topCourse}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="glass card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BookOpen size={20} className="gradient-text" />
                            Pending Course Enrollments
                          </h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          {analytics.flatMap(s => (s.enrollments || []).map(e => ({ ...e, studentName: s.name, studentId: s.id }))).filter(e => e.status === 'pending').length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                              <thead>
                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <th style={{ textAlign: 'left', paddingBottom: '15px', fontWeight: 600 }}>Student</th>
                                  <th style={{ textAlign: 'left', paddingBottom: '15px', fontWeight: 600 }}>Course</th>
                                  <th style={{ textAlign: 'right', paddingBottom: '15px', fontWeight: 600 }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analytics.flatMap(s => (s.enrollments || []).map(e => ({ ...e, studentName: s.name, studentId: s.id }))).filter(e => e.status === 'pending').map(enrollment => (
                                  <tr key={enrollment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '15px 0' }}>{enrollment.studentName}</td>
                                    <td style={{ padding: '15px 0' }}>{enrollment.courseTitle}</td>
                                    <td style={{ padding: '15px 0', textAlign: 'right' }}>
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                          onClick={() => handleEnrollmentStatusUpdate(enrollment.id, 'active')}
                                          style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >Approve</button>
                                        <button
                                          onClick={() => handleEnrollmentStatusUpdate(enrollment.id, 'rejected')}
                                          style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >Reject</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending enrollments</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="glass card">
                    <h3 style={{ marginBottom: '20px' }}>Recommendations</h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}></div>
                      <div>
                        <h4 style={{ marginBottom: '4px' }}>Advanced SQL Patterns</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Based on your recent activity</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass card">
                  <h3 style={{ marginBottom: '20px' }}>Achievements</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {['🔥', '🏆', '🚀', '💡', '🎓'].map((emoji, i) => (
                      <div key={i} style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}>
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setIsLoginModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass"
              style={{ width: '450px', padding: '40px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '8px' }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                {isSignUp ? 'Join AI LMS and start your journey' : 'Sign in to continue learning'}
              </p>

              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.03)',
                padding: '4px',
                borderRadius: '12px',
                marginBottom: '32px'
              }}>
                {['student', 'instructor', 'admin'].map(r => (
                  <button
                    key={r}
                    onClick={() => setFormData({ ...formData, role: r })}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: formData.role === r ? 'var(--accent-gradient)' : 'transparent',
                      color: formData.role === r ? 'white' : 'var(--text-muted)',
                      textTransform: 'capitalize',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {isSignUp && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</p>}
                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
                  {loading ? 'Processing...' : `${isSignUp ? 'Register' : 'Sign In'} as ${formData.role}`}
                </button>
              </form>

              <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)' }}>
        <p>&copy; 2025 AI-Powered LMS. Built for the future of education.</p>
      </footer>
    </div>
  );
}

export default App;
