export default function generator ({ borders, colors, spacing }) {
  return {
    containerMargin: spacing.large,
    containerPadding: spacing.small,
    containerBorderColor: colors.fire,
    containerBorderRadius: borders.radiusLarge,
    containerBorderStyle: borders.style,
    containerBorderWidth: borders.widthSmall
  }
}
