import { Group, Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { IconZoomCheck } from "@tabler/icons-react";

import { useAtom, useAtomValue } from "jotai";
import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "zustand";
import { commands } from "@/bindings";
import EvalChart from "@/components/common/EvalChart";
import ProgressButton from "@/components/common/ProgressButton";
import { TreeStateContext } from "@/components/common/TreeStateContext";
import { activeTabAtom, currentReportModalOpenAtom } from "@/state/atoms";

import { getGameStats, getMainLine } from "@/utils/chess";
import { getNodeAtPath } from "@/utils/treeReducer";

import ReportModal from "./ReportModal";
import ReviewSummary from "./ReviewSummary";
import { REVIEW_INFO, reviewAtPath } from "@/utils/move-review";

function ReportPanel() {
  const { t } = useTranslation();

  const activeTab = useAtomValue(activeTabAtom);

  const store = useContext(TreeStateContext)!;
  const root = useStore(store, (s) => s.root);
  const position = useStore(store, (s) => s.position);
  const selected = getNodeAtPath(root, position);
  const parent = position.length ? getNodeAtPath(root, position.slice(0, -1)) : null;
  const best = parent?.engineBestMove;
  const review = reviewAtPath(root, position);
  const reviewInfo = review ? REVIEW_INFO[review.kind] : null;
  const classification = reviewInfo ? `${reviewInfo.symbol} ${reviewInfo.label}` : "尚未分析";
  const [reportingMode, setReportingMode] = useAtom(currentReportModalOpenAtom);

  const inProgress = useStore(store, (s) => s.report.inProgress);
  const setInProgress = useStore(store, (s) => s.setReportInProgress);

  const stats = useMemo(() => getGameStats(root), [root]);

  const handleCancel = useCallback(() => {
    commands.cancelAnalysis(`report_${activeTab}`);
  }, [activeTab]);

  const openReportingMode = useCallback(() => {
    setReportingMode(true);
  }, [setReportingMode]);

  const closeReportingMode = useCallback(() => {
    setReportingMode(false);
  }, [setReportingMode]);

  return (
    <ScrollArea offsetScrollbars>
      <ReportModal
        tab={activeTab!}
        initialFen={root.fen}
        moves={getMainLine(root)}
        reportingMode={reportingMode}
        closeReportingMode={closeReportingMode}
        setInProgress={setInProgress}
      />
      <Stack mb="lg" gap="0.4rem" mr="xs">
        <ProgressButton
          id={`report_${activeTab}`}
          redoable
          disabled={root.children.length === 0}
          leftIcon={<IconZoomCheck size="0.875rem" />}
          onClick={openReportingMode}
          onCancel={handleCancel}
          initInstalled={false}
          labels={{
            action: t("Board.Analysis.GenerateReport"),
            completed: t("Board.Analysis.ReportGenerated"),
            inProgress: t("Board.Analysis.GeneratingReport"),
          }}
          inProgress={inProgress}
          setInProgress={setInProgress}
        />

        {stats.whiteAccuracy > 0 && stats.blackAccuracy > 0 && (
          <Group grow>
            <AccuracyCard
              color={t("Common.WHITE")}
              accuracy={stats.whiteAccuracy}
              cpl={stats.whiteCPL}
            />
            <AccuracyCard
              color={t("Common.BLACK")}
              accuracy={stats.blackAccuracy}
              cpl={stats.blackCPL}
            />
          </Group>
        )}

        <Paper withBorder p="md">
          <EvalChart isAnalysing={inProgress} startAnalysis={openReportingMode} />
        </Paper>
        {position.length > 0 && best && (
          <Paper withBorder p="md">
            <Stack gap={4}>
              <Text fw={700} c={reviewInfo?.color}>
                {selected.san} · {classification}
              </Text>
              <Text size="sm">
                本步推荐：{best.san}（分析深度 {parent?.depth ?? "—"}）
              </Text>
              {review && (
                <Text size="sm">
                  预期得分变化：{(review.before * 100).toFixed(1)}% →{" "}
                  {(review.after * 100).toFixed(1)}% · 损失 {(review.loss * 100).toFixed(1)}{" "}
                  个百分点
                </Text>
              )}
              {reviewInfo && (
                <Text size="sm" c="dimmed">
                  {reviewInfo.description}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                点击棋谱或曲线逐步查看；最佳走法以本次引擎分析结果为准。
              </Text>
            </Stack>
          </Paper>
        )}

        <ReviewSummary />
      </Stack>
    </ScrollArea>
  );
}

function AccuracyCard({ color, cpl, accuracy }: { color: string; cpl: number; accuracy: number }) {
  const { t } = useTranslation();

  return (
    <Paper withBorder p="xs">
      <Group justify="space-between">
        <Stack gap={0} align="start">
          <Text c="dimmed">{color}</Text>
          <Text fz="sm">{cpl.toFixed(1)} ACPL</Text>
        </Stack>
        <Stack gap={0} align="center">
          <Text fz="xl" lh="normal">
            {accuracy.toFixed(1)}%
          </Text>
          <Text fz="sm" c="dimmed" lh="normal">
            {t("Board.Analysis.Accuracy")}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
export default ReportPanel;
