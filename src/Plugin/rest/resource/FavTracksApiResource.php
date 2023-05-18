<?php

namespace Drupal\spotify_songs\Plugin\rest\resource;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Provides a Demo Resource.
 *
 * @RestResource(
 *   id = "fav_tracks_api_resource",
 *   label = @Translation("Favorite tracks API"),
 *   uri_paths = {
 *     "canonical" = "/spotify_songs/api_resource",
 *     "create" = "/spotify_songs/api_resource/set"
 *   }
 * )
 */
class FavTracksApiResource extends ResourceBase {

  /**
   * A current user instance which is logged in the session.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected AccountProxyInterface $loggedUser;

  /**
   * Constructs a Drupal\rest\Plugin\ResourceBase object.
   *
   * @param array $configuration
   *   A configuration array which contains the information about
   *   the plugin instance.
   * @param string $plugin_id
   *   The module_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A currently logged user instance.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   A config factory instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    protected ConfigFactoryInterface $configFactory,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->loggedUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): ResourceBase|FavTracksApiResource| ContainerFactoryPluginInterface|static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('sample_rest_resource'),
      $container->get('current_user'),
      $container->get('config.factory'),

    );
  }

  /**
   * Responds to GET request.
   *
   * Returns a list of taxonomy terms (tracks).
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *    Throws exception expected.
   */
  public function get(): ResourceResponse {
    // Use currently logged user after passing authentication.
    if (!$this->loggedUser->hasPermission('access favorite songs config')) {
      throw new AccessDeniedHttpException();
    }

    $client_details = $this->configFactory->get('spotify_songs.client')->get('client_id') ?: '';
    $secret_details = $this->configFactory->get('spotify_songs.client')->get('client_secret') ?: '';

    $result = [
      'client_id' => $client_details,
      'client_secret' => $secret_details,
    ];
    $response = new ResourceResponse($result);
    $response->addCacheableDependency($result);
    return $response;
  }

  /**
   * Response to POST request.
   *
   * Sets spotify's credentials in config.
   */
  public function post($data): ResourceResponse {

    if (!$this->loggedUser->hasPermission('access favorite songs config')) {
      throw new AccessDeniedHttpException();
    }

    $config_api = $this->configFactory->getEditable('spotify_songs.client');
    $config_api->set('client_id', $data["client_id"])
      ->set('client_secret', $data["client_secret"])
      ->save();

    $message = $this->t("Spotify credentials saved.");

    return new ResourceResponse($message, 200);

  }

}
