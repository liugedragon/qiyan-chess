import { Anchor, Modal, Text } from "@mantine/core";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { arch, version as OSVersion, type } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function AboutModal({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { i18n } = useTranslation();
  const chinese = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("zh");
  const labels = chinese
    ? {
        title: "棋研 / QiyanChess",
        version: "版本",
        tauri: "Tauri 版本",
        os: "系统",
        upstream: "基于",
      }
    : {
        title: "QiyanChess",
        version: "Version",
        tauri: "Tauri version",
        os: "OS",
        upstream: "Based on",
      };
  const [info, setInfo] = useState<{
    version: string;
    tauri: string;
    os: string;
    architecture: string;
    osVersion: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const os = await type();
      const version = await getVersion();
      const tauri = await getTauriVersion();
      const architecture = await arch();
      const osVersion = await OSVersion();
      setInfo({ version, tauri, os, architecture, osVersion });
    }
    load();
  }, []);
  return (
    <Modal centered opened={opened} onClose={() => setOpened(false)} title={labels.title}>
      <Text>
        {labels.version}: {info?.version}
      </Text>
      <Text>
        {labels.tauri}: {info?.tauri}
      </Text>
      <Text>
        {labels.os}: {info?.os} {info?.architecture} {info?.osVersion}
      </Text>

      <br />

      <Anchor
        href="https://github.com/liugedragon/qiyan-chess"
        target="_blank"
        rel="noreferrer"
        style={{ overflowWrap: "anywhere" }}
      >
        github.com/liugedragon/qiyan-chess
      </Anchor>
      <Text size="sm" mt="md">
        {labels.upstream}{" "}
        <Anchor
          href="https://github.com/franciscoBSalgueiro/en-croissant"
          target="_blank"
          rel="noreferrer"
        >
          En Croissant
        </Anchor>
        {" · GPL-3.0"}
      </Text>
    </Modal>
  );
}

export default AboutModal;
