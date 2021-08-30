import * as Preact from "preact";
export default function Logo(props: Preact.JSX.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width={288 / 4}
      height={66 / 4}
      viewBox="0 0 433 98"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="255" width="178" height="98" rx="8" fill="#8F58C7" />
      <path
        d="M292.479 36.248C289.215 36.248 286.647 37.592 284.775 40.28C282.903 42.968 281.967 46.712 281.967 51.512C281.967 56.36 282.903 60.056 284.775 62.6C286.647 65.096 289.479 66.344 293.271 66.344C295.527 66.344 297.711 66.032 299.823 65.408C301.983 64.784 304.143 64.016 306.303 63.104V74.84C304.047 75.848 301.719 76.568 299.319 77C296.967 77.48 294.447 77.72 291.759 77.72C286.191 77.72 281.631 76.616 278.079 74.408C274.527 72.2 271.911 69.128 270.231 65.192C268.551 61.208 267.711 56.624 267.711 51.44C267.711 46.256 268.671 41.672 270.591 37.688C272.511 33.704 275.319 30.584 279.015 28.328C282.759 26.024 287.295 24.872 292.623 24.872C295.119 24.872 297.735 25.16 300.471 25.736C303.207 26.312 305.895 27.224 308.535 28.472L304.287 39.416C302.415 38.504 300.519 37.76 298.599 37.184C296.679 36.56 294.639 36.248 292.479 36.248ZM338.733 77L328.221 39.992H327.933C328.029 40.952 328.125 42.248 328.221 43.88C328.317 45.512 328.413 47.288 328.509 49.208C328.605 51.08 328.653 52.904 328.653 54.68V77H316.341V25.592H334.845L345.573 62.096H345.861L356.373 25.592H374.877V77H362.133V54.464C362.133 52.832 362.157 51.104 362.205 49.28C362.253 47.408 362.325 45.656 362.421 44.024C362.517 42.344 362.589 41.024 362.637 40.064H362.349L351.981 77H338.733ZM419.574 61.376C419.574 64.16 418.854 66.8 417.414 69.296C416.022 71.792 413.838 73.832 410.862 75.416C407.934 76.952 404.118 77.72 399.414 77.72C397.062 77.72 394.998 77.6 393.222 77.36C391.494 77.168 389.862 76.832 388.326 76.352C386.79 75.872 385.206 75.248 383.574 74.48V62.096C386.358 63.488 389.166 64.568 391.998 65.336C394.83 66.056 397.398 66.416 399.702 66.416C401.766 66.416 403.278 66.056 404.238 65.336C405.198 64.616 405.678 63.704 405.678 62.6C405.678 61.256 404.958 60.176 403.518 59.36C402.126 58.496 399.75 57.32 396.39 55.832C393.846 54.632 391.638 53.384 389.766 52.088C387.894 50.744 386.454 49.112 385.446 47.192C384.438 45.272 383.934 42.848 383.934 39.92C383.934 36.608 384.75 33.848 386.382 31.64C388.014 29.384 390.27 27.704 393.15 26.6C396.078 25.448 399.462 24.872 403.302 24.872C406.662 24.872 409.686 25.256 412.374 26.024C415.062 26.744 417.462 27.584 419.574 28.544L415.326 39.272C413.118 38.264 410.934 37.472 408.774 36.896C406.662 36.272 404.694 35.96 402.87 35.96C401.094 35.96 399.774 36.272 398.91 36.896C398.094 37.52 397.686 38.312 397.686 39.272C397.686 40.088 397.998 40.808 398.622 41.432C399.246 42.056 400.278 42.752 401.718 43.52C403.206 44.24 405.222 45.176 407.766 46.328C410.262 47.432 412.374 48.656 414.102 50C415.878 51.296 417.222 52.856 418.134 54.68C419.094 56.456 419.574 58.688 419.574 61.376Z"
        fill="white"
      />
      <path
        d="M54.8009 77H36.5849L17.7929 40.784H17.5049C17.6009 41.888 17.6969 43.232 17.7929 44.816C17.8889 46.352 17.9609 47.912 18.0089 49.496C18.1049 51.08 18.1529 52.52 18.1529 53.816V77H5.84088V25.592H23.9849L42.7049 61.304H42.9209C42.8729 60.2 42.8009 58.904 42.7049 57.416C42.6089 55.928 42.5369 54.416 42.4889 52.88C42.4409 51.344 42.4169 50 42.4169 48.848V25.592H54.8009V77ZM113.984 51.224C113.984 56.552 113.12 61.208 111.392 65.192C109.712 69.128 107.024 72.2 103.328 74.408C99.6798 76.616 94.9038 77.72 88.9998 77.72C83.2398 77.72 78.5118 76.616 74.8158 74.408C71.1198 72.2 68.3838 69.104 66.6078 65.12C64.8798 61.136 64.0158 56.48 64.0158 51.152C64.0158 45.824 64.9038 41.192 66.6798 37.256C68.4558 33.272 71.1918 30.2 74.8878 28.04C78.5838 25.88 83.3118 24.8 89.0718 24.8C94.9278 24.8 99.6798 25.904 103.328 28.112C107.024 30.272 109.712 33.344 111.392 37.328C113.12 41.264 113.984 45.896 113.984 51.224ZM78.6318 51.224C78.6318 55.88 79.4238 59.528 81.0078 62.168C82.6398 64.808 85.3038 66.128 88.9998 66.128C92.8398 66.128 95.5278 64.808 97.0638 62.168C98.5998 59.528 99.3678 55.88 99.3678 51.224C99.3678 46.568 98.5998 42.896 97.0638 40.208C95.5278 37.52 92.8638 36.176 89.0718 36.176C85.2798 36.176 82.5918 37.52 81.0078 40.208C79.4238 42.896 78.6318 46.568 78.6318 51.224ZM145.655 77L135.143 39.992H134.855C134.951 40.952 135.047 42.248 135.143 43.88C135.239 45.512 135.335 47.288 135.431 49.208C135.527 51.08 135.575 52.904 135.575 54.68V77H123.263V25.592H141.767L152.495 62.096H152.783L163.295 25.592H181.799V77H169.055V54.464C169.055 52.832 169.079 51.104 169.127 49.28C169.175 47.408 169.247 45.656 169.343 44.024C169.439 42.344 169.511 41.024 169.559 40.064H169.271L158.903 77H145.655ZM240.968 51.224C240.968 56.552 240.104 61.208 238.376 65.192C236.696 69.128 234.008 72.2 230.312 74.408C226.664 76.616 221.888 77.72 215.984 77.72C210.224 77.72 205.496 76.616 201.8 74.408C198.104 72.2 195.368 69.104 193.592 65.12C191.864 61.136 191 56.48 191 51.152C191 45.824 191.888 41.192 193.664 37.256C195.44 33.272 198.176 30.2 201.872 28.04C205.568 25.88 210.296 24.8 216.056 24.8C221.912 24.8 226.664 25.904 230.312 28.112C234.008 30.272 236.696 33.344 238.376 37.328C240.104 41.264 240.968 45.896 240.968 51.224ZM205.616 51.224C205.616 55.88 206.408 59.528 207.992 62.168C209.624 64.808 212.288 66.128 215.984 66.128C219.824 66.128 222.512 64.808 224.048 62.168C225.584 59.528 226.352 55.88 226.352 51.224C226.352 46.568 225.584 42.896 224.048 40.208C222.512 37.52 219.848 36.176 216.056 36.176C212.264 36.176 209.576 37.52 207.992 40.208C206.408 42.896 205.616 46.568 205.616 51.224Z"
        fill="#87D787"
      />
    </svg>
  );
}
