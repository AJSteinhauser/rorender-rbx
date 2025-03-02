<!-- Improved compatibility of back to top link: See: https://github.com/AJSteinhauser/rorender-rbx/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/AJSteinhauser/rorender-rbx">
    <img src="images/icon.png" alt="Logo" width="120" height="120">
  </a>

  <h3 align="center">RoRender Plugin</h3>

  <p align="center">
    A Roblox plugin to generate maps for RoRenderV4
    <br />
    <a href="https://rorender.com/redirect/plugin"><strong>Roblox Plugin</strong></a>
    &middot;
    <a href="https://rorender.com"><strong>RoRender Website</strong></a>
    <br />
    <br />
    <a href="https://rorender.com/demo/village">View Demo</a>
    &middot;
    <a href="https://github.com/AJSteinhauser/rorender-rbx/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/AJSteinhauser/rorender-rbx/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
    &middot;
    <a href="https://github.com/AJSteinhauser/rorender-rbx/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project

This is the Roblox Plugin side of RoRender V4. This is open sourced so that game developers can customize how their map is rendered.
The code here is responsible for 4 things, with the most room for improvements being in UI and Raytracing. 

1. Plugin UI and configuration deployment
2. Raytracing and gathering supplemental data for the editor 
3. Compressing data
4. Splitting and transmitting the data to the RoRender backend

The data is expected in a very particular format for the editor to function properly, so pull requests and bug fixes will be tested 
thoroughly before being accepted.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![roblox-ts][roblox-ts]][roblox-ts-url]
* [![rbxts-react][rbxts-react]][rbxts-react-url]

Thanks to these two projects, I was able to write the entire stack—front end, back end, and plugin—using a single language: TypeScript 🤯. 
Having one unified language to tackle every part of the project was a game-changer for development speed, and I’m incredibly grateful to the maintainers 
of these projects for making such an awesome developer experience possible. While I do hope to rewrite the backend in a more performant language someday, 
for a small project like this, sticking to one language has been an amazing experience.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

Ensure latest npm and Rojo is installed
* npm
  ```sh
  npm install npm@latest -g
  ```
* [Rojo](https://rojo.space/docs/v7/getting-started/installation/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Either build it into your local plugin directory, or serve it 
   ```sh
   npm run build
   npm run serve
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- ROADMAP -->
## Roadmap

- [x] Auto configure render cube 
- [ ] Allow users to Resend render to another UUID if initial UUID was invalid
- [x] Viewfinder for render preview
- [x] Beta Testing
- [ ] Advanced config screen
- [ ] Direct buffer manipulation for RLE & huffman encoding 
- [ ] Multi-language Support
    - [ ] Chinese
    - [ ] Spanish
- [ ] Add Changelog

See the [open issues](https://github.com/AJSteinhauser/rorender-rbx/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors:

<a href="https://github.com/AJSteinhauser/rorender-rbx/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AJSteinhauser/rorender-rbx" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the Unlicense License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

AJ Steinhauser - [@roblox_reteach](https://twitter.com/roblox_reteach) - support@rorender.com

Project Link: [https://github.com/AJSteinhauser/rorender-rbx](https://github.com/AJSteinhauser/rorender-rbx)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
<!--## Acknowledgments-->
<!---->
<!--Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!-->

<!--* [Choose an Open Source License](https://choosealicense.com)-->
<!--* [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)-->
<!--* [Malven's Flexbox Cheatsheet](https://flexbox.malven.co/)-->
<!--* [Malven's Grid Cheatsheet](https://grid.malven.co/)-->
<!--* [Img Shields](https://shields.io)-->
<!--* [GitHub Pages](https://pages.github.com)-->
<!--* [Font Awesome](https://fontawesome.com)-->
<!--* [React Icons](https://react-icons.github.io/react-icons/search)-->

<p align="right">(<a href="#readme-top">back to top</a>)</p>



Project Link: [https://github.com/AJSteinhauser/rorender-rbx](https://github.com/AJSteinhauser/rorender-rbx)
<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Discord-shield]: https://img.shields.io/discord/1330005977021546526
[contributors-shield]: https://img.shields.io/github/contributors/AJSteinhauser/rorender-rbx.svg?style=for-the-badge
[contributors-url]: https://github.com/AJSteinhauser/rorender-rbx/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/AJSteinhauser/rorender-rbx.svg?style=for-the-badge
[forks-url]: https://github.com/AJSteinhauser/rorender-rbx/network/members
[stars-shield]: https://img.shields.io/github/stars/AJSteinhauser/rorender-rbx.svg?style=for-the-badge
[stars-url]: https://github.com/AJSteinhauser/rorender-rbx/stargazers
[issues-shield]: https://img.shields.io/github/issues/AJSteinhauser/rorender-rbx.svg?style=for-the-badge
[issues-url]: https://github.com/AJSteinhauser/rorender-rbx/issues
[license-shield]: https://img.shields.io/github/license/AJSteinhauser/rorender-rbx.svg?style=for-the-badge
[license-url]: https://github.com/AJSteinhauser/rorender-rbx/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew

[rbxts-react]: https://img.shields.io/badge/rbxts--react-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[rbxts-react-url]: https://github.com/littensy/rbxts-react

[roblox-ts]: https://img.shields.io/badge/rbxts-20232A?style=for-the-badge&logo=typescript&logoColor=3178C6
[roblox-ts-url]: https://roblox-ts.com/
