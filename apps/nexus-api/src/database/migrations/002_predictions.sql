CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  prediction_type TEXT NOT NULL,
  prediction_model TEXT NOT NULL,
  forecast_period JSONB NOT NULL DEFAULT '{}'::jsonb,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  predicted_outcome JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  actual_outcome JSONB,
  accuracy_score DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_goal_id ON predictions(goal_id);
CREATE INDEX IF NOT EXISTS idx_predictions_project_id ON predictions(project_id);
CREATE INDEX IF NOT EXISTS idx_predictions_prediction_type ON predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
