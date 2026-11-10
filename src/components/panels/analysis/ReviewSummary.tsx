import { Button, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { useContext } from "react";
import { useStore } from "zustand";
import { TreeStateContext } from "@/components/common/TreeStateContext";
import { REVIEW_INFO, reviewAtPath, type ReviewKind } from "@/utils/move-review";
import { treeIteratorMainLine } from "@/utils/treeReducer";

export default function ReviewSummary() {
  const store = useContext(TreeStateContext)!;
  const root = useStore(store, (s) => s.root);
  const goToMove = useStore(store, (s) => s.goToMove);
  const paths = Object.fromEntries(
    Object.keys(REVIEW_INFO).map((kind) => [
      kind,
      { white: [] as number[][], black: [] as number[][] },
    ]),
  ) as Record<ReviewKind, { white: number[][]; black: number[][] }>;
  for (const item of treeIteratorMainLine(root)) {
    const review = reviewAtPath(root, item.position);
    if (review) paths[review.kind][item.node.halfMoves % 2 ? "white" : "black"].push(item.position);
  }
  return (
    <Paper withBorder p="sm">
      <Stack gap={2}>
        <Group justify="space-between">
          <Text size="xs">白方</Text>
          <Text fw={600}>逐步评级 · 点击数量定位</Text>
          <Text size="xs">黑方</Text>
        </Group>
        {(Object.keys(REVIEW_INFO) as ReviewKind[]).map((kind) => {
          const info = REVIEW_INFO[kind];
          return (
            <Group key={kind} justify="space-between" wrap="nowrap">
              <Button
                variant="subtle"
                size="xs"
                color={info.color}
                disabled={!paths[kind].white.length}
                onClick={() => goToMove(paths[kind].white[0])}
              >
                {paths[kind].white.length}
              </Button>
              <Tooltip label={info.description}>
                <Text size="sm" c={info.color}>
                  <b>{info.symbol}</b>　{info.label}
                </Text>
              </Tooltip>
              <Button
                variant="subtle"
                size="xs"
                color={info.color}
                disabled={!paths[kind].black.length}
                onClick={() => goToMove(paths[kind].black[0])}
              >
                {paths[kind].black.length}
              </Button>
            </Group>
          );
        })}
        <Text size="xs" c="dimmed">
          损失按引擎预期得分（胜 + 半个和棋）估计；鼠标停在评级上查看规则。
        </Text>
      </Stack>
    </Paper>
  );
}
