"use client";

import { useParams } from "next/navigation";
import DepmapParamsForm from "./depmap";
import TcgaParamsForm from "./tcga";
import { Box, Typography } from "@mui/material";

interface ParamsComponentProps {
  subTool: string;
  values: { [key: string]: any };
  onChange: (values: { [key: string]: any }) => void;
}

export default function ParamsComponent({
  subTool,
  values,
  onChange,
}: ParamsComponentProps) {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  // Simple slug-based routing to parameter forms
  if (slug.startsWith("db_depmap")) {
    return (
      <DepmapParamsForm
        subTool={subTool as any}
        values={values}
        onChange={onChange}
      />
    );
  }

  if (slug.startsWith("db_tcga")) {
    return (
      <TcgaParamsForm
        subTool={subTool as any}
        values={values}
        onChange={onChange}
      />
    );
  }

  // Default: let the parent render its generic DynamicParameterForm
  return (
    <Box>
      <Typography variant="body1" color="text.secondary">
        该功能暂未开放，敬请期待。
      </Typography>
    </Box>
  );
}
