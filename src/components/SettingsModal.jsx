import React from 'react';
import { audio } from '../utils/audio';

/**
 * Standard Settings Modal Panel:
 * Supports:
 * - [Clickable Circular SFX Icon] + SFX Volume Slider
 * - [Clickable Circular Music Icon] + Music Volume Slider
 * - [Clickable Circular Voice Icon] + Voice Volume Slider
 */
export const SettingsModal = ({
  onClose,
  sfxVolume,
  setSfxVolume,
  sfxMuted,
  setSfxMuted,
  musicVolume,
  setMusicVolume,
  musicMuted,
  setMusicMuted,
  speechVolume,
  setSpeechVolume,
  speechMuted,
  setSpeechMuted,
  onToggleBridgeDebug
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 150,
        animation: 'popIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '40px',
          border: '8px solid #facc15',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.55), 0 0 50px rgba(250, 204, 21, 0.4)',
          padding: '46px 56px',
          width: '680px',
          textAlign: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '44px',
            fontWeight: '900',
            color: '#1e293b',
            marginBottom: '6px',
            fontFamily: "'Fredoka', sans-serif"
          }}
        >
          ⚙️ Audio Settings
        </div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#64748b', marginBottom: '36px' }}>
          ध्वनि र संगीत सेटिङहरू (Sound & Music)
        </div>

        {/* Audio Controls List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '38px' }}>
          {/* 1. SFX Row: [Clickable Circular Icon] + Slider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f1f5f9',
              padding: '18px 26px',
              borderRadius: '28px',
              border: '3.5px solid #e2e8f0',
              gap: '20px'
            }}
          >
            {/* Clickable SFX Circular Icon */}
            <button
              onClick={() => {
                const nextMuted = !sfxMuted;
                setSfxMuted(nextMuted);
                audio.sfxMuted = nextMuted;
                if (!nextMuted) audio.playSelect();
              }}
              title={sfxMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              style={{
                width: '74px',
                height: '74px',
                minWidth: '74px',
                borderRadius: '50%',
                background: sfxMuted || sfxVolume === 0 ? '#94a3b8' : '#22c55e',
                color: '#ffffff',
                border: '4px solid #ffffff',
                boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                fontSize: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {sfxMuted || sfxVolume === 0 ? '🔕' : '🔔'}
            </button>

            {/* Slider & Label Container */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>
                  Sound Effects (SFX)
                </span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7' }}>
                  {sfxMuted ? 'Muted' : `${Math.round(sfxVolume * 100)}%`}
                </span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxMuted ? 0 : sfxVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSfxVolume(val);
                  setSfxMuted(val === 0);
                  audio.setSfxVolume(val);
                }}
                style={{
                  width: '100%',
                  height: '16px',
                  borderRadius: '10px',
                  accentColor: '#22c55e',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* 2. Music Row: [Clickable Circular Icon] + Slider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f1f5f9',
              padding: '18px 26px',
              borderRadius: '28px',
              border: '3.5px solid #e2e8f0',
              gap: '20px'
            }}
          >
            {/* Clickable Music Circular Icon */}
            <button
              onClick={() => {
                const nextMuted = !musicMuted;
                setMusicMuted(nextMuted);
                audio.musicMuted = nextMuted;
                if (nextMuted) {
                  audio.stopBGM();
                } else {
                  audio.startBGM();
                }
              }}
              title={musicMuted ? 'Unmute Background Music' : 'Mute Background Music'}
              style={{
                width: '74px',
                height: '74px',
                minWidth: '74px',
                borderRadius: '50%',
                background: musicMuted || musicVolume === 0 ? '#94a3b8' : '#f59e0b',
                color: '#ffffff',
                border: '4px solid #ffffff',
                boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                fontSize: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {musicMuted || musicVolume === 0 ? '🔇' : '🎵'}
            </button>

            {/* Slider & Label Container */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>
                  Background Music
                </span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#d97706' }}>
                  {musicMuted ? 'Muted' : `${Math.round(musicVolume * 100)}%`}
                </span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicMuted ? 0 : musicVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setMusicVolume(val);
                  setMusicMuted(val === 0);
                  audio.setMusicVolume(val);
                  if (val > 0) audio.startBGM();
                }}
                style={{
                  width: '100%',
                  height: '16px',
                  borderRadius: '10px',
                  accentColor: '#f59e0b',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* 3. Voice Speech Row: [Clickable Circular Icon] + Slider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f1f5f9',
              padding: '18px 26px',
              borderRadius: '28px',
              border: '3.5px solid #e2e8f0',
              gap: '20px'
            }}
          >
            {/* Clickable Voice Circular Icon */}
            <button
              onClick={() => {
                const nextMuted = !speechMuted;
                setSpeechMuted(nextMuted);
                audio.speechMuted = nextMuted;
                if (!nextMuted) audio.speakWord('English pronunciation enabled');
              }}
              title={speechMuted ? 'Unmute English Voice' : 'Mute English Voice'}
              style={{
                width: '74px',
                height: '74px',
                minWidth: '74px',
                borderRadius: '50%',
                background: speechMuted || speechVolume === 0 ? '#94a3b8' : '#3b82f6',
                color: '#ffffff',
                border: '4px solid #ffffff',
                boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                fontSize: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {speechMuted || speechVolume === 0 ? '🤐' : '🗣️'}
            </button>

            {/* Slider & Label Container */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>
                  English Pronunciation Voice
                </span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb' }}>
                  {speechMuted ? 'Muted' : `${Math.round(speechVolume * 100)}%`}
                </span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={speechMuted ? 0 : speechVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSpeechVolume(val);
                  setSpeechMuted(val === 0);
                  audio.setSpeechVolume(val);
                }}
                style={{
                  width: '100%',
                  height: '16px',
                  borderRadius: '10px',
                  accentColor: '#3b82f6',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Right Circular Close Button with X cross icon */}
        <button
          onClick={() => {
            audio.playSelect();
            onClose();
          }}
          title="Close"
          style={{
            position: 'absolute',
            bottom: '-28px',
            right: '-28px',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            border: '4px solid #ffffff',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.5), 0 0 16px rgba(0, 0, 0, 0.25)',
            fontSize: '30px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.12)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(220, 38, 38, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(220, 38, 38, 0.5), 0 0 16px rgba(0, 0, 0, 0.25)';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
