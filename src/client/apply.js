    // Layer: register styles, atmosphere, settings, overlays; all reversible.
    function apply(ctx) {
      var theme = ctx.get('theme')
      if (theme === undefined) return
      var controller = createController()
      var dispose = runWithRollback([
        function () { return controller.installStyles() },
        function () {
          controller.applyAtmosphere(theme)
          return function () { controller.teardownAtmosphere() }
        },
        function () {
          if (typeof ctx.on !== 'function') return undefined
          return ctx.on('theme/change', function () {
            applyBoundWallpaper(theme)
            controller.applyAtmosphere(theme)
            controller.notifySettings()
          })
        },
        function () {
          var slots = ctx.get('slots')
          if (slots === undefined || React === undefined) return undefined
          return slots.inject('settings.section', function () {
            return slots.register(
              {
                name: 'settings.section',
                id: 'theme',
                order: 8,
                label: function () {
                  var lang = ''
                  try { lang = (document.documentElement.lang || navigator.language || '').toLowerCase() } catch (e) {}
                  return lang.indexOf('zh') === 0 ? '主题' : 'Theme'
                },
                children: { 'settings.theme.item': { kind: 'list', scope: 'root' } },
              },
              function ThemeSection(props) {
                var renderSlot = props && props.renderSlot
                return React.createElement(
                  'div',
                  { 'data-dsh-theme-page': '' },
                  renderSlot ? renderSlot('settings.theme.item', {}) : null,
                )
              },
            )
          })
        },
        function () {
          var slots = ctx.get('slots')
          if (slots === undefined || React === undefined) return undefined
          return slots.inject('settings.theme.item', function () {
            return slots.register(
              { name: 'settings.theme.item', id: 'liquid-glass-' + controller.id, order: 30 },
              function LiquidGlassSettings() {
                return React.createElement(SettingsRow, { theme: theme, controller: controller })
              },
            )
          })
        },
        function () {
          var slots = ctx.get('slots')
          if (slots === undefined || React === undefined) return undefined
          return slots.inject('shell.overlay', function () {
            return slots.register(
              { name: 'shell.overlay', id: 'liquid-glass-metrics-' + controller.id, order: 0 },
              MetricsBridge,
            )
          })
        },
        function () {
          var slots = ctx.get('slots')
          if (slots === undefined || React === undefined) return undefined
          return slots.inject('shell.overlay', function () {
            return slots.register(
              { name: 'shell.overlay', id: 'liquid-glass-metal-' + controller.id, order: 1 },
              ComposerMetal,
            )
          })
        },
      ])
      ctx.effect(function () { return dispose })
    }
