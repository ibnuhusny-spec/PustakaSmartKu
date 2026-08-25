import React, { useState, useEffect } from 'react';
import { Trophy, Award, Sparkles, Star, CheckCircle2, HelpCircle, Radio, AlertCircle, RefreshCw, PlusCircle, Trash2, Edit, X, BookOpen } from 'lucide-react';
import { saveMember, getMemberByRfid, getQuizzes, saveQuiz, deleteQuiz } from '../services/db';
import { speakText, playSoundEffect } from '../services/audioService';
import confetti from 'canvas-confetti';

export default function LeaderboardView({ members, onRefreshData }) {
  const sortedMembers = [...members].sort((a, b) => (b.points || 0) - (a.points || 0));

  const [quizzes, setQuizzes] = useState(getQuizzes());
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [activePlayer, setActivePlayer] = useState(null);
  const [quizState, setQuizState] = useState('idle'); // idle, playing, correct, wrong
  const [selectedOpt, setSelectedOpt] = useState(null);

  // Admin Quiz Manager Modal States
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quizFormData, setQuizFormData] = useState({
    id: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctIdx: 0,
    rewardPoints: 15,
    penaltyPoints: 20
  });

  const currentQuiz = quizzes[activeQuizIndex] || quizzes[0] || {
    question: 'Belum ada soal kuis. Klik "+ Tambah Soal Kuis Baru" untuk membuat soal!',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIdx: 0,
    rewardPoints: 15,
    penaltyPoints: 20
  };

  const refreshQuizzes = () => {
    const fresh = getQuizzes();
    setQuizzes(fresh);
  };

  // Listen for RFID Tap to identify WHO is playing the quiz game!
  useEffect(() => {
    const handleQuizRfidScan = (e) => {
      const { rfidUid } = e.detail;
      if (!rfidUid) return;

      const member = getMemberByRfid(rfidUid);
      if (member) {
        setActivePlayer(member);
        setQuizState('playing');
        setSelectedOpt(null);
        playSoundEffect('success');
        speakText(`Kuis Literasi dimulai untuk ${member.name}. Silakan jawab pertanyaan di layar!`);
      } else {
        playSoundEffect('error');
        alert(`Kartu RFID (UID: ${rfidUid}) belum terdaftar di database siswa.`);
      }
    };

    window.addEventListener('rfid-scanned', handleQuizRfidScan);
    return () => window.removeEventListener('rfid-scanned', handleQuizRfidScan);
  }, []);

  const handleAnswerQuiz = (optionIdx) => {
    if (!activePlayer) {
      alert("Silakan Tap Kartu RFID Fisik Anda terlebih dahulu untuk memulai kuis!");
      return;
    }

    setSelectedOpt(optionIdx);

    if (optionIdx === currentQuiz.correctIdx) {
      // Correct answer! Award +15 points
      const updatedPoints = (activePlayer.points || 0) + (currentQuiz.rewardPoints || 15);
      const updatedMember = { ...activePlayer, points: updatedPoints };
      
      saveMember(updatedMember);
      onRefreshData();
      
      setQuizState('correct');
      playSoundEffect('success');
      confetti({ particleCount: 70, spread: 80 });
      speakText(`Hebat sekali ${activePlayer.name}! Jawaban Anda benar. Anda mendapatkan bonus ${currentQuiz.rewardPoints || 15} poin literasi!`);
    } else {
      // Wrong answer! Deduct -20 points (penalty)
      const updatedPoints = Math.max(0, (activePlayer.points || 0) - (currentQuiz.penaltyPoints || 20));
      const updatedMember = { ...activePlayer, points: updatedPoints };

      saveMember(updatedMember);
      onRefreshData();

      setQuizState('wrong');
      playSoundEffect('error');
      speakText(`Waduh, jawaban kurang tepat! Poin ${activePlayer.name} berkurang ${currentQuiz.penaltyPoints || 20} poin.`);
    }
  };

  const handleNextQuiz = () => {
    if (quizzes.length === 0) return;
    const nextIdx = (activeQuizIndex + 1) % quizzes.length;
    setActiveQuizIndex(nextIdx);
    setQuizState('idle');
    setActivePlayer(null);
    setSelectedOpt(null);
  };

  const handleOpenAddQuizModal = (quiz = null) => {
    if (quiz) {
      setQuizFormData({
        id: quiz.id,
        question: quiz.question,
        optionA: quiz.options[0] || '',
        optionB: quiz.options[1] || '',
        optionC: quiz.options[2] || '',
        optionD: quiz.options[3] || '',
        correctIdx: quiz.correctIdx || 0,
        rewardPoints: quiz.rewardPoints || 15,
        penaltyPoints: quiz.penaltyPoints || 20
      });
    } else {
      setQuizFormData({
        id: '',
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctIdx: 0,
        rewardPoints: 15,
        penaltyPoints: 20
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveQuizForm = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!quizFormData.question.trim() || !quizFormData.optionA.trim() || !quizFormData.optionB.trim()) {
      alert('Pertanyaan kuis dan minimal Pilihan A & Pilihan B wajib diisi!');
      return;
    }

    const quizObj = {
      id: quizFormData.id || `Q-${Date.now().toString().slice(-4)}`,
      question: quizFormData.question.trim(),
      options: [
        quizFormData.optionA.trim(),
        quizFormData.optionB.trim(),
        quizFormData.optionC.trim() || 'Lainnya',
        quizFormData.optionD.trim() || 'Semua Benar'
      ],
      correctIdx: Number(quizFormData.correctIdx),
      rewardPoints: Number(quizFormData.rewardPoints) || 15,
      penaltyPoints: Number(quizFormData.penaltyPoints) || 20
    };

    saveQuiz(quizObj);
    refreshQuizzes();
    setIsAddModalOpen(false);
    alert('BERHASIL! Soal Kuis Baru telah disimpan ke Bank Soal Perpustakaan!');
  };

  const handleDeleteQuiz = (id) => {
    if (window.confirm('Yakin ingin menghapus soal kuis ini dari Bank Soal?')) {
      deleteQuiz(id);
      refreshQuizzes();
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Hero Podium Section */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        padding: '32px 24px',
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: '#ffffff',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)'
        }}>
          <Trophy size={36} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Papan Peringkat Duta Baca Sekolah
        </h2>
        <p style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 24px auto', fontSize: '0.92rem' }}>
          Penghargaan untuk siswa paling rajin membaca buku, presensi di perpustakaan, & pemenang kuis literasi!
        </p>

        {/* TOP 3 PODIUM */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Rank 2 (Silver) */}
          {sortedMembers[1] && (
            <div style={{ textAlign: 'center', width: '160px' }}>
              <img src={sortedMembers[1].avatar} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid #94a3b8', background: '#1e293b' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '6px', color: '#f1f5f9' }}>{sortedMembers[1].name}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sortedMembers[1].classGrade}</div>
              <div style={{
                background: 'linear-gradient(180deg, #94a3b8, #64748b)',
                height: '100px',
                borderRadius: '12px 12px 0 0',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.4rem'
              }}>
                🥈 2nd
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>{sortedMembers[1].points} Pts</div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {sortedMembers[0] && (
            <div style={{ textAlign: 'center', width: '180px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '-6px' }}>👑</div>
              <img src={sortedMembers[0].avatar} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #fbbf24', background: '#1e293b' }} />
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: '6px', color: '#fbbf24' }}>{sortedMembers[0].name}</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{sortedMembers[0].classGrade}</div>
              <div style={{
                background: 'linear-gradient(180deg, #f59e0b, #d97706)',
                height: '130px',
                borderRadius: '12px 12px 0 0',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.6rem',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)'
              }}>
                🥇 1st
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>{sortedMembers[0].points} Pts</div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {sortedMembers[2] && (
            <div style={{ textAlign: 'center', width: '160px' }}>
              <img src={sortedMembers[2].avatar} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid #b45309', background: '#1e293b' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '6px', color: '#f1f5f9' }}>{sortedMembers[2].name}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sortedMembers[2].classGrade}</div>
              <div style={{
                background: 'linear-gradient(180deg, #d97706, #78350f)',
                height: '80px',
                borderRadius: '12px 12px 0 0',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.3rem'
              }}>
                🥉 3rd
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>{sortedMembers[2].points} Pts</div>
            </div>
          )}

        </div>

      </div>

      {/* QUIZ CHALLENGE GAMIFICATION CARD */}
      <div className="glass-card" style={{
        padding: '28px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles color="#10b981" /> Game Kuis Literasi Interaktif (Benar +{currentQuiz.rewardPoints || 15} | Salah -{currentQuiz.penaltyPoints || 20})
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Bank Soal Aktif: <strong>{quizzes.length} Pertanyaan</strong> • Soal #{activeQuizIndex + 1}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleOpenAddQuizModal()}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <PlusCircle size={14} /> + Input Soal Kuis Sendiri
            </button>
            <button 
              onClick={() => setIsManageModalOpen(true)}
              className="btn btn-emerald"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <BookOpen size={14} /> Kelola Bank Soal ({quizzes.length})
            </button>
            <button 
              onClick={handleNextQuiz}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <RefreshCw size={14} /> Acak Soal Kuis
            </button>
          </div>
        </div>

        {/* STEP 1: PLAYER IDENTIFICATION VIA RFID TAP */}
        {!activePlayer ? (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '2px dashed rgba(16, 185, 129, 0.5)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div className="rfid-pulse" style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#ffffff'
            }}>
              <Radio size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#34d399' }}>
              Langkah 1: Tempelkan Kartu RFID Anda Terlebih Dahulu!
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0 }}>
              Tempelkan kartu RFID pada reader untuk mendaftar sebagai pemain. Benar dapat <strong>+{currentQuiz.rewardPoints || 15} Poin</strong>, namun jika salah berkurang <strong>-{currentQuiz.penaltyPoints || 20} Poin</strong>!
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={activePlayer.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b' }} />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                  Pemain Aktif: {activePlayer.name} ({activePlayer.classGrade})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Poin Saat Ini: <strong style={{ color: '#fbbf24' }}>{activePlayer.points} Pts</strong>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setActivePlayer(null)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Ganti Pemain
            </button>
          </div>
        )}

        {/* STEP 2: QUIZ QUESTION & OPTIONS */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            SOAL KUIS LITERASI #{activeQuizIndex + 1}:
          </div>
          <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            {currentQuiz.question}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {currentQuiz.options.map((opt, idx) => {
              let btnStyle = 'btn-secondary';
              if (selectedOpt === idx) {
                btnStyle = idx === currentQuiz.correctIdx ? 'btn-emerald' : 'btn-rose';
              }

              return (
                <button 
                  key={opt + idx}
                  onClick={() => handleAnswerQuiz(idx)}
                  disabled={quizState === 'correct' || quizState === 'wrong'}
                  className={`btn ${btnStyle}`}
                  style={{
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    padding: '12px 16px',
                    opacity: (!activePlayer && selectedOpt === null) ? 0.75 : 1
                  }}
                >
                  <span style={{ fontWeight: 700, width: '24px' }}>{String.fromCharCode(65 + idx)}.</span> {opt}
                </button>
              );
            })}
          </div>

          {/* QUIZ RESULT FEEDBACK */}
          {quizState === 'correct' && (
            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                <CheckCircle2 size={24} />
                <span>JAWABAN BENAR! 🎉 Selamat, +{currentQuiz.rewardPoints || 15} Poin Literasi berhasil ditambahkan ke {activePlayer?.name}!</span>
              </div>
              <button onClick={handleNextQuiz} className="btn btn-emerald" style={{ fontSize: '0.8rem' }}>
                Soal Berikutnya →
              </button>
            </div>
          )}

          {quizState === 'wrong' && (
            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e', borderRadius: 'var(--radius-md)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                <AlertCircle size={24} />
                <span>JAWABAN SALAH! ⚠️ Poin {activePlayer?.name} berkurang -{currentQuiz.penaltyPoints || 20} Poin! (Jawaban Benar: "{currentQuiz.options[currentQuiz.correctIdx]}")</span>
              </div>
              <button onClick={handleNextQuiz} className="btn btn-rose" style={{ fontSize: '0.8rem' }}>
                Coba Soal Lain →
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Full Leaderboard Ranking Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0' }}>Peringkat Seluruh Anggota Duta Baca:</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Peringkat</th>
                <th style={{ padding: '12px' }}>Nama Siswa / Guru</th>
                <th style={{ padding: '12px' }}>Kelas</th>
                <th style={{ padding: '12px' }}>Gelar & Badge</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Total Poin</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((m, idx) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 800, color: idx < 3 ? '#fbbf24' : 'inherit' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={m.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    {m.name}
                  </td>
                  <td style={{ padding: '12px' }}>{m.classGrade}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-purple">{m.badge || 'Pembaca Aktif ⭐'}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                    {m.points} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT CUSTOM QUIZ QUESTION MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Form Input Soal Kuis Literasi Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveQuizForm}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label">Pertanyaan Soal Kuis *</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3"
                    value={quizFormData.question}
                    onChange={e => setQuizFormData({ ...quizFormData, question: e.target.value })}
                    placeholder="Contoh: Siapakah pendiri Kerajaan Majapahit..."
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Pilihan A *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={quizFormData.optionA}
                      onChange={e => setQuizFormData({ ...quizFormData, optionA: e.target.value })}
                      placeholder="Jawaban A..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pilihan B *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={quizFormData.optionB}
                      onChange={e => setQuizFormData({ ...quizFormData, optionB: e.target.value })}
                      placeholder="Jawaban B..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pilihan C</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={quizFormData.optionC}
                      onChange={e => setQuizFormData({ ...quizFormData, optionC: e.target.value })}
                      placeholder="Jawaban C..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pilihan D</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={quizFormData.optionD}
                      onChange={e => setQuizFormData({ ...quizFormData, optionD: e.target.value })}
                      placeholder="Jawaban D..."
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Kunci Jawaban Benar *</label>
                    <select 
                      className="form-select"
                      value={quizFormData.correctIdx}
                      onChange={e => setQuizFormData({ ...quizFormData, correctIdx: Number(e.target.value) })}
                    >
                      <option value={0}>Pilihan A</option>
                      <option value={1}>Pilihan B</option>
                      <option value={2}>Pilihan C</option>
                      <option value={3}>Pilihan D</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bonus Poin Benar</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={quizFormData.rewardPoints}
                      onChange={e => setQuizFormData({ ...quizFormData, rewardPoints: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Penalti Poin Salah</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={quizFormData.penaltyPoints}
                      onChange={e => setQuizFormData({ ...quizFormData, penaltyPoints: Number(e.target.value) })}
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Batal</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveQuizForm}>Simpan Soal Kuis</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE BANK OF QUIZZES MODAL */}
      {isManageModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen color="#10b981" /> Kelola Bank Soal Kuis Literasi ({quizzes.length} Soal)
              </h3>
              <button onClick={() => setIsManageModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <div className="modal-body">
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Daftar soal kuis yang tersimpan di database perpustakaan:
                </span>
                <button onClick={() => handleOpenAddQuizModal()} className="btn btn-primary" style={{ fontSize: '0.78rem' }}>
                  <PlusCircle size={14} /> + Tambah Soal Baru
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {quizzes.map((q, i) => (
                  <div key={q.id || i} style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>Soal #{i + 1} (Kunci: {String.fromCharCode(65 + q.correctIdx)})</div>
                      <h4 style={{ margin: '4px 0 8px 0', fontSize: '0.95rem' }}>{q.question}</h4>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span>A: {q.options[0]}</span>
                        <span>B: {q.options[1]}</span>
                        <span>C: {q.options[2]}</span>
                        <span>D: {q.options[3]}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleOpenAddQuizModal(q)} className="btn btn-secondary" style={{ padding: '6px 8px', fontSize: '0.75rem' }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteQuiz(q.id)} className="btn btn-rose" style={{ padding: '6px 8px', fontSize: '0.75rem' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsManageModalOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
