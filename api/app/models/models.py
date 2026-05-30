"""
AXIOMX — Database Models
SQLAlchemy async models for the reasoning platform.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, DateTime, Float, Boolean, Integer,
    ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship
import enum


class Base(DeclarativeBase):
    pass


# ─── Enums ────────────────────────────────────────────────────────────────────

class AgentRole(str, enum.Enum):
    PLANNER = "strategic_planner"
    RESEARCHER = "researcher"
    CRITIC = "critic"
    VERIFIER = "verifier"
    RISK_ANALYST = "risk_analyst"
    OPTIMIZER = "optimizer"
    MEMORY = "memory"
    DECIDER = "decider"


class SessionStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScenarioMode(str, enum.Enum):
    BUSINESS_STRATEGY = "business_strategy"
    CYBERSECURITY = "cybersecurity"
    SCIENTIFIC_RESEARCH = "scientific_research"
    STARTUP_PLANNING = "startup_planning"
    DEBATE = "debate"
    RISK_FORECASTING = "risk_forecasting"
    AI_DECISION = "ai_decision"


# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    sessions = relationship("ReasoningSession", back_populates="user")


class ReasoningSession(Base):
    __tablename__ = "reasoning_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    query = Column(Text, nullable=False)
    scenario_mode = Column(SAEnum(ScenarioMode), default=ScenarioMode.BUSINESS_STRATEGY)
    status = Column(SAEnum(SessionStatus), default=SessionStatus.ACTIVE)
    final_output = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    total_agents_used = Column(Integer, default=0)
    total_reasoning_steps = Column(Integer, default=0)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")
    reasoning_steps = relationship("ReasoningStep", back_populates="session", order_by="ReasoningStep.step_order")
    agent_interactions = relationship("AgentInteraction", back_populates="session")


class ReasoningStep(Base):
    __tablename__ = "reasoning_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("reasoning_sessions.id"), nullable=False)
    agent_role = Column(SAEnum(AgentRole), nullable=False)
    step_order = Column(Integer, nullable=False)
    thought = Column(Text, nullable=False)
    reasoning_type = Column(String(100), nullable=True)  # analysis, critique, verification, etc.
    confidence = Column(Float, nullable=True)
    parent_step_id = Column(UUID(as_uuid=True), ForeignKey("reasoning_steps.id"), nullable=True)
    is_contradiction = Column(Boolean, default=False)
    is_correction = Column(Boolean, default=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    duration_ms = Column(Integer, nullable=True)

    session = relationship("ReasoningSession", back_populates="reasoning_steps")
    parent = relationship("ReasoningStep", remote_side=[id])


class AgentInteraction(Base):
    __tablename__ = "agent_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("reasoning_sessions.id"), nullable=False)
    from_agent = Column(SAEnum(AgentRole), nullable=False)
    to_agent = Column(SAEnum(AgentRole), nullable=False)
    interaction_type = Column(String(100), nullable=False)  # challenge, agree, delegate, verify
    message = Column(Text, nullable=False)
    confidence_delta = Column(Float, nullable=True)  # how much confidence changed
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ReasoningSession", back_populates="agent_interactions")


class MemoryEntry(Base):
    __tablename__ = "memory_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("reasoning_sessions.id"), nullable=True)
    memory_type = Column(String(50), nullable=False)  # conversation, reasoning, insight, fact
    content = Column(Text, nullable=False)
    importance_score = Column(Float, default=0.5)
    embedding_vector = Column(JSON, nullable=True)  # store as JSON for now, switch to pgvector later
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_accessed_at = Column(DateTime, nullable=True)
    access_count = Column(Integer, default=0)
