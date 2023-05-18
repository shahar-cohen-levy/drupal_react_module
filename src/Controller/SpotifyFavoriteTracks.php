<?php

namespace Drupal\spotify_songs\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Provides route responses for the Favorite songs' module.
 */
class SpotifyFavoriteTracks extends ControllerBase {

  /**
   * Build React based search and list favorite songs page.
   */
  public function build(): array {
    global $base_url;
    return [
      '#markup' => '<div id="fa-songs-api"></div>',
      '#attached' => [
        'library' => [
          'spotify_songs/spotify-songs-api',
        ],
        'drupalSettings' => [
          'dataFromDrupal' => [
            'baseUrl' => $base_url,
          ],
        ],
      ],
    ];
  }

}
