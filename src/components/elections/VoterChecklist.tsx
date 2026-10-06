'use client';

import React, { useState } from 'react';

export interface VoterChecklistProps {
  electionName: string;
  electionDate: Date | string;
  registrationDeadline?: Date | string | null;
  earlyVotingStart?: Date | string | null;
  earlyVotingEnd?: Date | string | null;
  officialPortalUrl?: string | null;
}

function formatDate(dateInput?: Date | string | null, fallback = 'Check local rules'): string {
  if (!dateInput) return fallback;
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateInput?: Date | string | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function daysUntil(dateInput?: Date | string | null): number | null {
  if (!dateInput) return null;
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function VoterChecklist({
  electionName,
  electionDate,
  registrationDeadline,
  earlyVotingStart,
  earlyVotingEnd,
  officialPortalUrl,
}: VoterChecklistProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const daysToElection = daysUntil(electionDate);
  const daysToReg = daysUntil(registrationDeadline);

  const portalHref = officialPortalUrl || 'https://vote.gov';

  return (
    <section className="voter-utility" aria-label="Voter Preparation and Key Dates">
      {/* Top Banner Header */}
      <div className="vu-header">
        <div className="vu-title-block">
          <div className="vu-tag">
            <span className="vu-tag-dot" aria-hidden="true" />
            Nonpartisan Voter Guide
          </div>
          <h1 className="vu-main-title">{electionName}</h1>
          <p className="vu-sub">
            Your vote shapes your community. Below are your key deadlines, tools to check your registration,
            and unbiased information about who is running.
          </p>
        </div>

        {daysToElection !== null && daysToElection >= 0 && (
          <div className="vu-countdown-pill" aria-label={`Election day countdown: ${daysToElection} days left`}>
            <span className="vu-countdown-number">{daysToElection}</span>
            <span className="vu-countdown-label">day{daysToElection === 1 ? '' : 's'} until election day</span>
          </div>
        )}
      </div>

      {/* Key Dates Timeline Cards */}
      <div className="vu-dates-grid">
        {/* Registration Card */}
        <div className="vu-date-card">
          <div className="vu-date-icon" aria-hidden="true">📝</div>
          <div className="vu-date-body">
            <span className="vu-date-title">1. Voter Registration</span>
            <span className="vu-date-value">
              {registrationDeadline ? formatDate(registrationDeadline) : 'Check your state cutoff'}
            </span>
            <span className="vu-date-badge">
              {daysToReg !== null ? (
                daysToReg > 0 ? (
                  `${daysToReg} day${daysToReg === 1 ? '' : 's'} left to register`
                ) : daysToReg === 0 ? (
                  'Deadline is today'
                ) : (
                  'Deadline passed (check same-day registration)'
                )
              ) : (
                'Verify your status early'
              )}
            </span>
          </div>
        </div>

        {/* Early Voting Card */}
        <div className="vu-date-card">
          <div className="vu-date-icon" aria-hidden="true">🗳️</div>
          <div className="vu-date-body">
            <span className="vu-date-title">2. Early & Mail Voting</span>
            <span className="vu-date-value">
              {earlyVotingStart && earlyVotingEnd
                ? `${formatShortDate(earlyVotingStart)} – ${formatDate(earlyVotingEnd)}`
                : earlyVotingStart
                ? `Starts ${formatDate(earlyVotingStart)}`
                : 'Options vary by area'}
            </span>
            <span className="vu-date-badge">In-person & absentee</span>
          </div>
        </div>

        {/* Election Day Card */}
        <div className="vu-date-card highlight">
          <div className="vu-date-icon" aria-hidden="true">🏛️</div>
          <div className="vu-date-body">
            <span className="vu-date-title">3. Election Day</span>
            <span className="vu-date-value">{formatDate(electionDate)}</span>
            <span className="vu-date-badge">Polling places open</span>
          </div>
        </div>
      </div>

      {/* Interactive 3-Step Decision Flow */}
      <div className="vu-decision-flow">
        <div className="vu-tabs" role="tablist" aria-label="Voter steps">
          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 1}
            id="vu-tab-1"
            aria-controls="vu-panel-1"
            className={`vu-tab-btn ${activeStep === 1 ? 'active' : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <span className="vu-step-num">Step 1</span>
            <span className="vu-step-text">Are you registered?</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 2}
            id="vu-tab-2"
            aria-controls="vu-panel-2"
            className={`vu-tab-btn ${activeStep === 2 ? 'active' : ''}`}
            onClick={() => setActiveStep(2)}
          >
            <span className="vu-step-num">Step 2</span>
            <span className="vu-step-text">Plan how to vote</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 3}
            id="vu-tab-3"
            aria-controls="vu-panel-3"
            className={`vu-tab-btn ${activeStep === 3 ? 'active' : ''}`}
            onClick={() => setActiveStep(3)}
          >
            <span className="vu-step-num">Step 3</span>
            <span className="vu-step-text">Need help or support?</span>
          </button>
        </div>

        {/* Panel 1: Check Registration */}
        {activeStep === 1 && (
          <div
            id="vu-panel-1"
            role="tabpanel"
            aria-labelledby="vu-tab-1"
            className="vu-panel"
          >
            <div className="vu-panel-content">
              <h3>Confirm your registration before deadline</h3>
              <p>
                Voter registration rules depend on where you live. Some jurisdictions allow same-day
                registration at the polls, while others require you to register several weeks before election day.
                If you recently moved or changed your legal name, you may need to update your registration.
              </p>
              <ul className="vu-check-list">
                <li>Check that your address matches where you currently reside.</li>
                <li>Make sure your signature is up to date if voting by mail.</li>
                <li>Check what ID your state requires at check-in.</li>
              </ul>
              <div className="vu-actions">
                <a
                  href={portalHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vu-primary-btn"
                >
                  Check registration status on Vote.gov ↗
                </a>
                <a
                  href="https://www.vote.org/am-i-registered-to-vote/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vu-secondary-btn"
                >
                  Look up your state voter record ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Panel 2: Plan How to Vote */}
        {activeStep === 2 && (
          <div
            id="vu-panel-2"
            role="tabpanel"
            aria-labelledby="vu-tab-2"
            className="vu-panel"
          >
            <div className="vu-panel-content">
              <h3>Choose your voting method and check your poll hours</h3>
              <p>
                Deciding when and where you will vote prevents last-minute scrambles. You usually have three
                choices depending on your state:
              </p>
              <div className="vu-methods-grid">
                <div className="vu-method-card">
                  <b>🗳️ Vote Early in Person</b>
                  <span>Cast your ballot days or weeks ahead at designated county voting centers.</span>
                </div>
                <div className="vu-method-card">
                  <b>📬 Vote by Mail / Absentee</b>
                  <span>Request an absentee ballot early and return it via secure drop box or USPS.</span>
                </div>
                <div className="vu-method-card">
                  <b>🏛️ Vote on Election Day</b>
                  <span>Visit your assigned precinct polling station during official polling hours.</span>
                </div>
              </div>
              <div className="vu-actions">
                <a
                  href="https://www.vote.org/polling-place-locator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vu-primary-btn"
                >
                  Find your polling place & hours ↗
                </a>
                <a
                  href="https://www.vote.org/early-voting-calendar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vu-secondary-btn"
                >
                  Check early voting dates for your area ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Panel 3: Need Help */}
        {activeStep === 3 && (
          <div
            id="vu-panel-3"
            role="tabpanel"
            aria-labelledby="vu-tab-3"
            className="vu-panel"
          >
            <div className="vu-panel-content">
              <h3>Free, nonpartisan voter support</h3>
              <p>
                Every eligible voter has the right to cast a secret, unhindered ballot. If you have questions about
                accessibility, registration problems, or what to bring, trained nonpartisan volunteers are available to help.
              </p>
              <div className="vu-hotlines-box">
                <div className="vu-hotline-item">
                  <span className="vu-hotline-lang">English:</span>
                  <a href="tel:1-866-687-8683" className="vu-hotline-num">866-OUR-VOTE (866-687-8683)</a>
                </div>
                <div className="vu-hotline-item">
                  <span className="vu-hotline-lang">Spanish / Español:</span>
                  <a href="tel:1-888-839-8682" className="vu-hotline-num">888-VE-Y-VOTA (888-839-8682)</a>
                </div>
                <div className="vu-hotline-item">
                  <span className="vu-hotline-lang">Asian Languages:</span>
                  <a href="tel:1-888-274-8683" className="vu-hotline-num">888-API-VOTE (888-274-8683)</a>
                </div>
                <div className="vu-hotline-item">
                  <span className="vu-hotline-lang">Arabic:</span>
                  <a href="tel:1-844-925-5287" className="vu-hotline-num">844-YALLA-US (844-925-5287)</a>
                </div>
              </div>
              <div className="vu-actions">
                <a
                  href="https://www.nass.org/can-i-vote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vu-primary-btn"
                >
                  Contact your local elections office ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nonpartisan Guarantee Banner */}
      <div className="vu-neutrality-notice">
        <span className="vu-notice-icon" aria-hidden="true">⚖️</span>
        <p>
          <strong>Nonpartisan policy:</strong> HearOURVOICES does not endorse candidates, accept campaign funds,
          or tell anyone who to vote for. All candidate comparisons below are verified against public records and
          campaign policy statements.
        </p>
      </div>
    </section>
  );
}
