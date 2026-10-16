// src/components/SyncBoard.jsx
import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBoardSync } from '../hooks/useBoardSync';
import { Plus, Users, Sparkles, MessageSquare, LogOut, CheckCircle2 } from 'lucide-react';

const INITIAL_BOARD = {
  todo: [
    { id: 'c-1', title: 'Implement Redis Pub/Sub sync', priority: 'HIGH', assignedTo: 'You' },
    { id: 'c-2', title: 'Design dark-mode glassmorphic theme', priority: 'MEDIUM', assignedTo: 'Alex' }
  ],
  in_progress: [
    { id: 'c-3', title: 'STOMP channel interceptor for Auth', priority: 'URGENT', assignedTo: 'You' }
  ],
  done: [
    { id: 'c-4', title: 'Docker multi-stage backend setup', priority: 'LOW', assignedTo: 'Kanishk' }
  ]
};

export default function SyncBoard() {
  const { user, token, logout } = useAuth();
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [draggingCard, setDraggingCard] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [activeColInput, setActiveColInput] = useState(null);

  // Handle updates made by other users in real time
  const handleRemoteAction = useCallback((payload) => {
    if (payload.type === 'CARD_MOVED') {
      const { cardId, sourceColumn, destColumn } = payload;
      setBoard(prev => {
        const sourceList = [...prev[sourceColumn]];
        const cardIndex = sourceList.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return prev;
        const [movedCard] = sourceList.splice(cardIndex, 1);
        const destList = [...prev[destColumn], movedCard];
        return { ...prev, [sourceColumn]: sourceList, [destColumn]: destList };
      });
    } else if (payload.type === 'CARD_CREATED') {
      setBoard(prev => ({
        ...prev,
        [payload.destColumn]: [...prev[payload.destColumn], payload.cardData]
      }));
    }
  }, []);

  const { broadcastAction, connectedUsers, isConnected } = useBoardSync(
    'board-101',
    token,
    user,
    handleRemoteAction
  );

  // Drag and drop handlers
  const handleDragStart = (card, sourceColumn) => {
    setDraggingCard({ card, sourceColumn });
  };

  const handleDrop = (destColumn) => {
    if (!draggingCard || draggingCard.sourceColumn === destColumn) return;

    const { card, sourceColumn } = draggingCard;

    // Optimistic local update
    setBoard(prev => {
      const src = prev[sourceColumn].filter(c => c.id !== card.id);
      const dst = [...prev[destColumn], card];
      return { ...prev, [sourceColumn]: src, [destColumn]: dst };
    });

    // Broadcast change to other users
    broadcastAction({
      type: 'CARD_MOVED',
      cardId: card.id,
      sourceColumn,
      destColumn
    });

    setDraggingCard(null);
  };

  const handleAddCard = (colKey) => {
    if (!newCardTitle.trim()) return;
    const newCard = {
      id: `c-${Date.now()}`,
      title: newCardTitle,
      priority: 'MEDIUM',
      assignedTo: user?.fullName || 'Teammate'
    };

    setBoard(prev => ({
      ...prev,
      [colKey]: [...prev[colKey], newCard]
    }));

    broadcastAction({
      type: 'CARD_CREATED',
      destColumn: colKey,
      cardData: newCard
    });

    setNewCardTitle('');
    setActiveColInput(null);
  };

  const columns = [
    { key: 'todo', title: 'To Do', color: 'border-amber-500/40 bg-amber-500/5' },
    { key: 'in_progress', title: 'In Progress', color: 'border-indigo-500/40 bg-indigo-500/5' },
    { key: 'done', title: 'Done', color: 'border-emerald-500/40 bg-emerald-500/5' }
  ];

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.logoBadge}>SB</div>
          <div>
            <h1 style={styles.boardTitle}>SyncBoard Core Architecture</h1>
            <p style={styles.boardSub}>Real-Time Collaborative Workspace</p>
          </div>
        </div>

        {/* Live Indicators & User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={styles.liveIndicator}>
            <span style={{
              ...styles.statusDot,
              backgroundColor: isConnected ? '#10b981' : '#f59e0b'
            }} />
            <span>{isConnected ? 'Sync Active' : 'Connecting...'}</span>
          </div>

          <div style={styles.collaboratorsGroup}>
            <Users size={16} color="#94a3b8" />
            <div style={styles.avatar}>{(user?.fullName || 'Me')[0]}</div>
            {connectedUsers.map((u, i) => (
              <div key={i} title={u} style={{ ...styles.avatar, backgroundColor: '#6366f1' }}>
                {u[0]}
              </div>
            ))}
          </div>

          <button onClick={logout} style={styles.logoutBtn}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Kanban Board Grid */}
      <div style={styles.kanbanGrid}>
        {columns.map(col => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.key)}
            style={styles.column}
          >
            <div style={styles.colHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={styles.colBadge}>{board[col.key].length}</span>
                <span style={styles.colTitle}>{col.title}</span>
              </div>
              <button
                onClick={() => setActiveColInput(activeColInput === col.key ? null : col.key)}
                style={styles.addBtn}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick Add Form */}
            {activeColInput === col.key && (
              <div style={styles.cardInputWrapper}>
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCard(col.key)}
                  autoFocus
                  style={styles.inputField}
                />
                <button onClick={() => handleAddCard(col.key)} style={styles.confirmBtn}>
                  Add Card
                </button>
              </div>
            )}

            {/* Cards List */}
            <div style={styles.cardList}>
              {board[col.key].map(card => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card, col.key)}
                  style={styles.card}
                >
                  <div style={styles.cardHeader}>
                    <span style={{
                      ...styles.priorityTag,
                      backgroundColor: card.priority === 'URGENT' ? '#ef444420' : '#6366f120',
                      color: card.priority === 'URGENT' ? '#f87171' : '#818cf8'
                    }}>
                      {card.priority}
                    </span>
                    <span style={styles.assignee}>{card.assignedTo}</span>
                  </div>
                  <p style={styles.cardText}>{card.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline styling for interactive glassmorphism & responsive layout
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#090d16',
    color: '#f8fafc',
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    padding: '24px 36px',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
  },
  boardTitle: { fontSize: '20px', fontWeight: '600', margin: 0 },
  boardSub: { fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%' },
  collaboratorsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '4px 10px',
    borderRadius: '20px'
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex'
  },
  kanbanGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    alignItems: 'start'
  },
  column: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '16px',
    padding: '18px',
    minHeight: '650px'
  },
  colHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  colBadge: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '600'
  },
  colTitle: { fontSize: '15px', fontWeight: '600', color: '#cbd5e1' },
  addBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    color: '#cbd5e1',
    borderRadius: '6px',
    padding: '6px',
    cursor: 'pointer'
  },
  cardInputWrapper: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '14px',
    border: '1px solid rgba(99, 102, 241, 0.3)'
  },
  inputField: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'transparent',
    border: 'none',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '8px'
  },
  confirmBtn: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cardList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'grab',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  priorityTag: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.5px'
  },
  assignee: { fontSize: '12px', color: '#64748b' },
  cardText: { margin: 0, fontSize: '14px', lineHeight: '1.4', color: '#e2e8f0' }
};