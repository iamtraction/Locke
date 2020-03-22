![String internationalization handler](https://i.imgur.com/3UBXzNe.png)

### Directory Sturcture for locales
```bash
ProjectDir/
└─── locales
     ├─── constants.yaml
     ├─── en_us
     │    ├─── error.yaml
     │    ├─── info.yaml
     │    └─── warn.yaml
     └─── en_uk
          ├─── error.yaml
          ├─── info.yaml
          └─── warn.yaml
```


**TODO:**
- [X] Add support for a global constants across all locales.
- [X] Add support for variables in translated strings.
- [ ] Add support for using single file locales, for simple projects. Like:
  ```bash
    # Director Sturcture for locales
    ProjectDir/
    └──── Locales
          ├─── constants.yaml
          ├─── en_us.yaml
          └─── en_uk.yaml
  ```
