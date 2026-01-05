"use client";

import { Paper, Typography } from "@mui/material";
import { Layer } from "../types";
import {
  BoxplotLayer,
  JitterLayer,
  PointLayer,
  ColLayer,
  LineLayer,
  RoundBoxplotLayer,
  SignifLayer,
  BezierLayer,
  AblineLayer,
  HlineLayer,
  VlineLayer,
  TextLayer,
  LabelLayer,
  AnnotateLayer,
  SegmentLayer,
  CurveLayer,
  CrossbarLayer,
  ErrorbarLayer,
  LinerangeLayer,
  PointrangeLayer,
  ErrorbarhLayer,
} from "../types";
import { GeomBoxplot } from "./GeomBoxplot";
import { GeomJitter } from "./GeomJitter";
import { GeomPoint } from "./GeomPoint";
import { GeomCol } from "./GeomCol";
import { GeomLine } from "./GeomLine";
import { GeomAbline, GeomHline, GeomVline } from "./GeomReferenceLine";
import { GeomText, GeomLabel } from "./GeomText";
import { Annotate } from "./Annotate";
import { GeomSegment } from "./GeomSegment";
import { GeomCurve } from "./GeomCurve";
import {
  GeomCrossbar,
  GeomErrorbar,
  GeomLinerange,
  GeomPointrange,
  GeomErrorbarh,
} from "./GeomInterval";
import {
  GeomRug,
  GeomSmooth,
  GeomDotplot,
  GeomCount,
  GeomHistogram,
  GeomFreqpoly,
  GeomDensity,
  GeomViolin,
  GeomArea,
  GeomRibbon,
  GeomStep,
  GeomPath,
  GeomPolygon,
  GeomTile,
  GeomRect,
  GeomContour,
  GeomContourFilled,
  GeomBin2d,
  GeomHex,
  GeomDensity2d,
  GeomDensity2dFilled,
  GeomQq,
  GeomQqLine,
  GeomBar,
  RugLayer,
  SmoothLayer,
  DotplotLayer,
  CountLayer,
  HistogramLayer,
  FreqpolyLayer,
  DensityLayer,
  ViolinLayer,
  AreaLayer,
  RibbonLayer,
  StepLayer,
  PathLayer,
  PolygonLayer,
  TileLayer,
  RectLayer,
  ContourLayer,
  ContourFilledLayer,
  Bin2dLayer,
  HexLayer,
  Density2dLayer,
  Density2dFilledLayer,
  QqLayer,
  QqLineLayer,
  BarLayer,
} from "./GeomMisc";
import {
  GeomRoundBoxplot,
  GeomRoundCol,
  GeomRoundRect,
  GeomRoundTile,
  GeomRoundBar,
  GeomRoundCrossbar,
  GeomRoundHistogram,
  GeomHalfRoundBoxplot,
  RoundColLayer,
  RoundRectLayer,
  RoundTileLayer,
  RoundBarLayer,
  RoundCrossbarLayer,
  RoundHistogramLayer,
  HalfRoundBoxplotLayer,
} from "../extension/GgRound";
import { GeomBezier } from "../extension/GeomBezier";
import { GeomSignif } from "../extension/GeomSignif";
import {
  GeomQuasirandom,
  QuasirandomLayer,
} from "../extension/GeomQuasirandom";
import { Ggsurvplot, GgsurvplotLayer } from "../extension/Survminer";
import {
  GeomTextRepel,
  GeomLabelRepel,
  TextRepelLayer,
  LabelRepelLayer,
} from "../extension/Ggrepel";
import { GeomTextpath, TextpathLayer } from "../extension/GeomTextpath";
import { GeomWaffle, WaffleLayer } from "../extension/GeomWaffle";
import {
  GeomShaping,
  GeomLinkETAnnotate,
  GeomCorr,
  GeomCurve2,
  GeomDoughnut,
  GeomDiagLabel,
  GeomSquare,
  GeomCouple,
  ShapingLayer,
  LinkETAnnotateLayer,
  CorrLayer,
  Curve2Layer,
  DoughnutLayer,
  DiagLabelLayer,
  SquareLayer,
  CoupleLayer,
} from "../extension/LinkET";
import {
  GeomGgcorLink,
  GeomGgcorMark,
  GeomGgcorNumber,
  GeomGgcorPie2,
  GeomGgcorRing,
  GeomGgcorShade,
  GeomGgcorSquare,
  GeomGgcorStar,
  GeomGgcorAddLink,
  GeomGgcorCross,
  GgcorLinkLayer,
  GgcorMarkLayer,
  GgcorNumberLayer,
  GgcorPie2Layer,
  GgcorRingLayer,
  GgcorShadeLayer,
  GgcorSquareLayer,
  GgcorStarLayer,
  GgcorAddLinkLayer,
  GgcorCrossLayer,
} from "../extension/Ggcor";
import {
  GeomHalfViolin,
  GeomHalfPoint,
  GeomHalfPointPanel,
  GeomHalfDotplot,
  GeomHalfBoxplot,
  HalfViolinLayer,
  HalfPointLayer,
  HalfPointPanelLayer,
  HalfDotplotLayer,
  HalfBoxplotLayer,
} from "../extension/Gghalves";
import {
  GeomRaster,
  AnnotationRaster,
  RasterLayer,
  AnnotationRasterLayer,
} from "./GeomRaster";
import {
  StatSummary,
  StatSummaryBin,
  StatSummary2d,
  StatSummaryHex,
  StatCount,
  StatBin,
  StatBin2d,
  StatBinhex,
  StatDensity,
  StatDensity2d,
  StatContour,
  StatContourFilled,
  StatBoxplot,
  StatYdensity,
  StatEcdf,
  StatQuantile,
  StatSmooth,
  StatFunction,
  StatQq,
  StatQqLine,
  StatUnique,
  StatIdentity,
  StatEllipse,
  StatSummaryLayer,
  StatSummaryBinLayer,
  StatSummary2dLayer,
  StatSummaryHexLayer,
  StatCountLayer,
  StatBinLayer,
  StatBin2dLayer,
  StatBinhexLayer,
  StatDensityLayer,
  StatDensity2dLayer,
  StatContourLayer,
  StatContourFilledLayer,
  StatBoxplotLayer,
  StatYdensityLayer,
  StatEcdfLayer,
  StatQuantileLayer,
  StatSmoothLayer,
  StatFunctionLayer,
  StatQqLayer,
  StatQqLineLayer,
  StatUniqueLayer,
  StatIdentityLayer,
  StatEllipseLayer,
} from "./Stat";
import {
  StatCor,
  StatChull,
  StatMean,
  StatCentralTendency,
  StatCompareMeans,
  StatPvalueManual,
  StatReglineEquation,
  StatStars,
  StatBracket,
  StatAnovaTest,
  StatKruskalTest,
  StatWilcoxTest,
  StatTTest,
  StatCorLayer,
  StatChullLayer,
  StatMeanLayer,
  StatCentralTendencyLayer,
  StatCompareLayer,
  StatPvalueManualLayer,
  StatReglineEquationLayer,
  StatStarsLayer,
  StatBracketLayer,
  StatAnovaSummaryLayer,
  StatKruskalTestLayer,
  StatWilcoxTestLayer,
  StatTTestLayer,
} from "../extension/GgpubrStat";

interface LayerRendererProps {
  layer: Layer;
  onChange: (layer: Layer) => void;
  columns: string[];
}

export const LayerRenderer: React.FC<LayerRendererProps> = ({
  layer,
  onChange,
  columns,
}) => {
  switch (layer.type) {
    case "geom_boxplot":
      return (
        <GeomBoxplot
          params={layer as BoxplotLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_round_boxplot":
      return (
        <GeomRoundBoxplot
          params={layer as RoundBoxplotLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_round_col":
      return (
        <GeomRoundCol
          params={layer as RoundColLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_round_rect":
      return (
        <GeomRoundRect
          params={layer as RoundRectLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_round_tile":
      return (
        <GeomRoundTile
          params={layer as RoundTileLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_round_bar":
      return (
        <GeomRoundBar
          params={layer as RoundBarLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_round_crossbar":
      return (
        <GeomRoundCrossbar
          params={layer as RoundCrossbarLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_round_histogram":
      return (
        <GeomRoundHistogram
          params={layer as RoundHistogramLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_half_round_boxplot":
      return (
        <GeomHalfRoundBoxplot
          params={layer as HalfRoundBoxplotLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_half_boxplot":
      return (
        <GeomHalfBoxplot
          params={layer as HalfBoxplotLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_half_violin":
      return (
        <GeomHalfViolin
          params={layer as HalfViolinLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_jitter":
      return (
        <GeomJitter
          params={layer as JitterLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_point":
      return (
        <GeomPoint
          params={layer as PointLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_half_point":
      return (
        <GeomHalfPoint
          params={layer as HalfPointLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_half_point_panel":
      return (
        <GeomHalfPointPanel
          params={layer as HalfPointPanelLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_col":
      return (
        <GeomCol
          params={layer as ColLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_line":
      return (
        <GeomLine
          params={layer as LineLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_abline":
      return (
        <GeomAbline
          params={layer as AblineLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_hline":
      return (
        <GeomHline
          params={layer as HlineLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_vline":
      return (
        <GeomVline
          params={layer as VlineLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_text":
      return (
        <GeomText
          params={layer as TextLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_label":
      return (
        <GeomLabel
          params={layer as LabelLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_text_repel":
      return (
        <GeomTextRepel
          params={layer as TextRepelLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_label_repel":
      return (
        <GeomLabelRepel
          params={layer as LabelRepelLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_textpath":
      return (
        <GeomTextpath
          params={layer as TextpathLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_waffle":
      return (
        <GeomWaffle
          params={layer as WaffleLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_shaping":
      return (
        <GeomShaping
          params={layer as ShapingLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_annotate":
      return (
        <GeomLinkETAnnotate
          params={layer as LinkETAnnotateLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_corr":
      return (
        <GeomCorr
          params={layer as CorrLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_curve2":
      return (
        <GeomCurve2
          params={layer as Curve2Layer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_doughnut":
      return (
        <GeomDoughnut
          params={layer as DoughnutLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_diag_label":
      return (
        <GeomDiagLabel
          params={layer as DiagLabelLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_square":
      // Check if it's a GgcorSquareLayer by checking for ggcor-specific properties
      // GgcorSquareLayer might have different default arguments
      // For now, default to linkET's SquareLayer
      return (
        <GeomSquare
          params={layer as SquareLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_couple":
      return (
        <GeomCouple
          params={layer as CoupleLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_link":
      return (
        <GeomGgcorLink
          params={layer as GgcorLinkLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_mark":
      return (
        <GeomGgcorMark
          params={layer as GgcorMarkLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_number":
      return (
        <GeomGgcorNumber
          params={layer as GgcorNumberLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_pie2":
      return (
        <GeomGgcorPie2
          params={layer as GgcorPie2Layer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_ring":
      return (
        <GeomGgcorRing
          params={layer as GgcorRingLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_shade":
      return (
        <GeomGgcorShade
          params={layer as GgcorShadeLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_star":
      return (
        <GeomGgcorStar
          params={layer as GgcorStarLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "add_link":
      return (
        <GeomGgcorAddLink
          params={layer as GgcorAddLinkLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_cross":
      return (
        <GeomGgcorCross
          params={layer as GgcorCrossLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "annotate":
      return (
        <Annotate
          params={layer as AnnotateLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_segment":
      return (
        <GeomSegment
          params={layer as SegmentLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_curve":
      return (
        <GeomCurve
          params={layer as CurveLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_signif":
      return (
        <GeomSignif
          params={layer as SignifLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_bezier":
      return (
        <GeomBezier
          params={layer as BezierLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_crossbar":
      return (
        <GeomCrossbar
          params={layer as CrossbarLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_errorbar":
      return (
        <GeomErrorbar
          params={layer as ErrorbarLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_linerange":
      return (
        <GeomLinerange
          params={layer as LinerangeLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_pointrange":
      return (
        <GeomPointrange
          params={layer as PointrangeLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_errorbarh":
      return (
        <GeomErrorbarh
          params={layer as ErrorbarhLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_quasirandom":
      return (
        <GeomQuasirandom
          params={layer as QuasirandomLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    // ggplot2 stat functions
    case "stat_summary":
      return (
        <StatSummary
          params={layer as StatSummaryLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_summary_bin":
      return (
        <StatSummaryBin
          params={layer as StatSummaryBinLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_summary_2d":
      return (
        <StatSummary2d
          params={layer as StatSummary2dLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_summary_hex":
      return (
        <StatSummaryHex
          params={layer as StatSummaryHexLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_count":
      return (
        <StatCount
          params={layer as StatCountLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_bin":
      return (
        <StatBin
          params={layer as StatBinLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_bin_2d":
      return (
        <StatBin2d
          params={layer as StatBin2dLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_binhex":
      return (
        <StatBinhex
          params={layer as StatBinhexLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_density":
      return (
        <StatDensity
          params={layer as StatDensityLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_density_2d":
      return (
        <StatDensity2d
          params={layer as StatDensity2dLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_contour":
      return (
        <StatContour
          params={layer as StatContourLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_contour_filled":
      return (
        <StatContourFilled
          params={layer as StatContourFilledLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_boxplot":
      return (
        <StatBoxplot
          params={layer as StatBoxplotLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_ydensity":
      return (
        <StatYdensity
          params={layer as StatYdensityLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_ecdf":
      return (
        <StatEcdf
          params={layer as StatEcdfLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_quantile":
      return (
        <StatQuantile
          params={layer as StatQuantileLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_smooth":
      return (
        <StatSmooth
          params={layer as StatSmoothLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_function":
      return (
        <StatFunction
          params={layer as StatFunctionLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_qq":
      return (
        <StatQq
          params={layer as StatQqLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_qq_line":
      return (
        <StatQqLine
          params={layer as StatQqLineLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_unique":
      return (
        <StatUnique
          params={layer as StatUniqueLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_identity":
      return (
        <StatIdentity
          params={layer as StatIdentityLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_ellipse":
      return (
        <StatEllipse
          params={layer as StatEllipseLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    // ggpubr stat functions
    case "stat_cor":
      return (
        <StatCor
          params={layer as StatCorLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_chull":
      return (
        <StatChull
          params={layer as StatChullLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_mean":
      return (
        <StatMean
          params={layer as StatMeanLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_central_tendency":
      return (
        <StatCentralTendency
          params={layer as StatCentralTendencyLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_compare_means":
      return (
        <StatCompareMeans
          params={layer as StatCompareLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_pvalue_manual":
      return (
        <StatPvalueManual
          params={layer as StatPvalueManualLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_regline_equation":
      return (
        <StatReglineEquation
          params={layer as StatReglineEquationLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_stars":
      return (
        <StatStars
          params={layer as StatStarsLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_bracket":
      return (
        <StatBracket
          params={layer as StatBracketLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_anova_test":
      return (
        <StatAnovaTest
          params={layer as StatAnovaSummaryLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_kruskal_test":
      return (
        <StatKruskalTest
          params={layer as StatKruskalTestLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_wilcox_test":
      return (
        <StatWilcoxTest
          params={layer as StatWilcoxTestLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "stat_t_test":
      return (
        <StatTTest
          params={layer as StatTTestLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    // Survminer components
    case "ggsurvplot":
      return (
        <Ggsurvplot
          params={layer as GgsurvplotLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    // Raster components
    case "annotation_raster":
      return (
        <AnnotationRaster
          params={layer as AnnotationRasterLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    // GeomMisc components
    case "geom_rug":
      return (
        <GeomRug
          params={layer as RugLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_smooth":
      return (
        <GeomSmooth
          params={layer as SmoothLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_dotplot":
      return (
        <GeomDotplot
          params={layer as DotplotLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_half_dotplot":
      return (
        <GeomHalfDotplot
          params={layer as HalfDotplotLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_count":
      return (
        <GeomCount
          params={layer as CountLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_histogram":
      return (
        <GeomHistogram
          params={layer as HistogramLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_freqpoly":
      return (
        <GeomFreqpoly
          params={layer as FreqpolyLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_density":
      return (
        <GeomDensity
          params={layer as DensityLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_violin":
      return (
        <GeomViolin
          params={layer as ViolinLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_area":
      return (
        <GeomArea
          params={layer as AreaLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_ribbon":
      return (
        <GeomRibbon
          params={layer as RibbonLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_step":
      return (
        <GeomStep
          params={layer as StepLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_path":
      return (
        <GeomPath
          params={layer as PathLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_polygon":
      return (
        <GeomPolygon
          params={layer as PolygonLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_tile":
      return (
        <GeomTile
          params={layer as TileLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_rect":
      return (
        <GeomRect
          params={layer as RectLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_raster":
      return (
        <GeomRaster
          params={layer as RasterLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_contour":
      return (
        <GeomContour
          params={layer as ContourLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_contour_filled":
      return (
        <GeomContourFilled
          params={layer as ContourFilledLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_bin_2d":
      return (
        <GeomBin2d
          params={layer as Bin2dLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_hex":
      return (
        <GeomHex
          params={layer as HexLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_density_2d":
      return (
        <GeomDensity2d
          params={layer as Density2dLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_density_2d_filled":
      return (
        <GeomDensity2dFilled
          params={layer as Density2dFilledLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_qq":
      return (
        <GeomQq
          params={layer as QqLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_qq_line":
      return (
        <GeomQqLine
          params={layer as QqLineLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    case "geom_bar":
      return (
        <GeomBar
          params={layer as BarLayer}
          onChange={onChange}
          columns={columns}
        />
      );
    default:
      return (
        <Paper sx={{ p: 2 }} elevation={1}>
          <Typography variant="body2" color="text.secondary">
            图层类型 "{layer.type}" 的配置组件尚未实现
          </Typography>
        </Paper>
      );
  }
};
